'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Opportunity, ArsenalProject, RadarDay, UndoAction } from '@/lib/types';
import { getOrbitStore } from '@/lib/store';
import { exportWorkspaceJson, parseWorkspaceJson } from '@/lib/backup';
import { useOrbitAuth } from './use-orbit-auth';
import { useOpportunityActions } from './use-opportunity-actions';
import { useOrbitDerived } from './use-orbit-derived';
import { useProjectRadarActions } from './use-project-radar-actions';
import {
  subscribeOpportunities,
  subscribeProjects,
  subscribeRadarDays,
  saveOpportunityToFirestore,
  deleteOpportunityFromFirestore,
  migrateLocalDataToFirestore,
} from '@/lib/liveStore';

export function useOrbitState() {
  const store = useMemo(() => getOrbitStore(), []);
  const initialLocal = useMemo(() => store.loadState(), [store]);
  const auth = useOrbitAuth();

  const [isGuestContinued, setIsGuestContinued] = useState<boolean>(
    () => !auth.isFirebaseReady || store.isGuestSessionActive()
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => initialLocal.opportunities);
  const [projects, setProjects] = useState<ArsenalProject[]>(() => initialLocal.projects);
  const [radarDays, setRadarDays] = useState<RadarDay[]>(() => initialLocal.radarDays);

  const oppsRef = useRef(opportunities);
  useEffect(() => {
    oppsRef.current = opportunities;
  }, [opportunities]);
  const [syncedUid, setSyncedUid] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState('');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [selectedRadarDate, setSelectedRadarDate] = useState<string>('');

  useEffect(() => {
    const onStorageErr = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      setErrorToast(msg || 'Browser storage error.');
    };
    window.addEventListener('orbit:storage-error', onStorageErr);
    return () => window.removeEventListener('orbit:storage-error', onStorageErr);
  }, []);

  useEffect(() => {
    if (!auth.user) return;
    const uid = auth.user.uid;

    const unsubOpps = subscribeOpportunities(
      uid,
      (remoteOpps) => {
        setOpportunities(remoteOpps);
        setSyncedUid(uid);
      },
      (err) => {
        setSyncedUid(uid);
        setErrorToast(`Cloud sync error: ${err.message}`);
      }
    );
    const unsubProjs = subscribeProjects(
      uid,
      (remoteProjs) => setProjects(remoteProjs),
      (err) => setErrorToast(`Cloud projects error: ${err.message}`)
    );
    const unsubRadar = subscribeRadarDays(
      uid,
      (remoteDays) => setRadarDays(remoteDays),
      (err) => setErrorToast(`Cloud radar error: ${err.message}`)
    );

    return () => {
      unsubOpps();
      unsubProjs();
      unsubRadar();
    };
  }, [auth.user]);

  const isCloudSyncing = auth.authLoading || (Boolean(auth.user) && syncedUid !== auth.user?.uid);

  const {
    projectsWithCounts, projectsMap, availableRadarDates,
    activeDay, activeRadarItems, counts, nextCodeNumber,
  } = useOrbitDerived(opportunities, projects, radarDays, selectedRadarDate);

  const handleContinueAsGuest = useCallback(() => {
    store.setGuestSessionActive(true);
    const local = store.loadState();
    setOpportunities(local.opportunities);
    setProjects(local.projects);
    setRadarDays(local.radarDays);
    setIsGuestContinued(true);
  }, [store]);

  const handleSignIn = useCallback(async () => {
    try {
      const u = await auth.signIn();
      if (u) {
        setOpportunities([]); setProjects([]); setRadarDays([]); setSelectedRadarDate(''); setUndoAction(null);
      }
      return u;
    } catch (err: any) {
      const code = err?.code || '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setErrorToast(err?.message || 'Google sign-in failed. Please try again.');
      }
      return null;
    }
  }, [auth]);

  const handleSignOut = useCallback(async () => {
    await auth.signOut();
    setSyncedUid(null); setOpportunities([]); setProjects([]); setRadarDays([]);
    setUserApiKey(''); setSelectedRadarDate(''); setUndoAction(null);
  }, [auth]);

  const updateOpportunities = useCallback((updater: (prev: Opportunity[]) => Opportunity[]) => {
    const prevSnapshot = oppsRef.current;
    const next = updater(prevSnapshot);
    setOpportunities(next);

    if (auth.user) {
      const uid = auth.user.uid;
      const changed = next.filter((opp) => {
        const prevOpp = prevSnapshot.find((p) => p.id === opp.id);
        return prevOpp !== opp;
      });
      if (changed.length > 0) {
        Promise.all(
          changed.map((opp) => {
            const prevOpp = prevSnapshot.find((p) => p.id === opp.id);
            return saveOpportunityToFirestore(uid, opp, {
              syncTasks: !prevOpp || prevOpp.tasks !== opp.tasks,
              syncChat: !prevOpp || prevOpp.aiChat !== opp.aiChat,
            });
          })
        ).catch((err) => setErrorToast(`Sync error: ${err.message}`));
      }
    } else {
      store.saveOpportunities(next);
    }
  }, [auth.user, store]);

  const {
    handleAdvanceStatus, handleArchive, handleRestoreOpportunity,
    handleToggleSubTask, handleAddSubTask, handleToggleProjectLink,
    handleAddMultipleSubTasks, handleUpdateApplicationCopy,
  } = useOpportunityActions({ opportunities, updateOpportunities, setUndoAction });

  const handleCreateOpportunity = useCallback((newOpp: Opportunity) => {
    const next = [newOpp, ...oppsRef.current];
    setOpportunities(next);
    if (auth.user) {
      saveOpportunityToFirestore(auth.user.uid, newOpp, {
        syncTasks: newOpp.tasks.length > 0, syncChat: false,
      }).catch((err) => setErrorToast(`Failed to save opportunity: ${err.message}`));
    } else {
      store.saveOpportunities(next);
    }
  }, [auth.user, store]);

  const handleUpdateOpportunity = useCallback((updated: Opportunity) => {
    updateOpportunities((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : o))
    );
  }, [updateOpportunities]);

  const handleDeleteOpportunity = useCallback((id: string) => {
    const prevSnapshot = oppsRef.current;
    const target = prevSnapshot.find((o) => o.id === id);
    if (!target) return;
    const next = prevSnapshot.filter((o) => o.id !== id);
    setOpportunities(next);

    if (auth.user) {
      deleteOpportunityFromFirestore(auth.user.uid, id).catch((err) => {
        setErrorToast(`Failed to delete track: ${err.message}`);
      });
    } else {
      store.saveOpportunities(next);
    }

    setUndoAction({
      id: `undo-del-${Date.now()}`,
      message: `Deleted ${target.code}`,
      timestamp: Date.now(),
      restore: () => {
        const restored = [target, ...oppsRef.current];
        setOpportunities(restored);
        if (auth.user) {
          saveOpportunityToFirestore(auth.user.uid, target).catch((err) => setErrorToast(`Failed to restore track: ${err.message}`));
        } else {
          store.saveOpportunities(restored);
        }
      },
    });
  }, [auth.user, store]);

  const {
    handlePromoteRadarItem, handleToggleVerifyRadarItem,
    handleAddProject, handleUpdateProject, handleDeleteProject,
  } = useProjectRadarActions({
    user: auth.user, store, opportunities, projects, activeDay, nextCodeNumber,
    setProjects, setRadarDays, setUndoAction, setErrorToast,
    updateOpportunities, handleCreateOpportunity,
  });

  const handleImportLocalToAccount = useCallback(async () => {
    if (!auth.user) throw new Error('Sign in required to import local data.');
    const local = store.loadState();
    return migrateLocalDataToFirestore(auth.user.uid, {
      opportunities: local.opportunities, projects: local.projects,
    });
  }, [auth.user, store]);

  const handleClearLocalData = useCallback(() => {
    store.clearLocalData();
    if (!auth.user) { setOpportunities([]); setProjects([]); setRadarDays([]); }
  }, [auth.user, store]);

  const handleResetGuestData = useCallback(() => {
    if (auth.user) return;
    store.clearLocalData();
    setOpportunities([]); setProjects([]); setRadarDays([]);
  }, [auth.user, store]);

  const handleExportJson = useCallback(() => {
    exportWorkspaceJson(opportunities, projectsWithCounts);
  }, [opportunities, projectsWithCounts]);

  const handleImportJson = useCallback(async (rawText: string) => {
    const parsed = parseWorkspaceJson(rawText);
    if (auth.user) return migrateLocalDataToFirestore(auth.user.uid, parsed);

    const existingOppIds = new Set(opportunities.map((o) => o.id));
    const existingHashes = new Set(opportunities.map((o) => o.urlHash).filter(Boolean));
    const existingProjIds = new Set(projects.map((p) => p.id));
    const existingTitleMap = new Map(projects.map((p) => [p.title.trim().toLowerCase(), p.id]));
    const projectIdRemap = new Map<string, string>();
    const newProjs: ArsenalProject[] = [];

    for (const p of parsed.projects) {
      const normTitle = p.title.trim().toLowerCase();
      const existingId = existingTitleMap.get(normTitle);
      if (existingId) projectIdRemap.set(p.id, existingId);
      else if (!existingProjIds.has(p.id)) {
        newProjs.push(p); existingProjIds.add(p.id); existingTitleMap.set(normTitle, p.id);
      }
    }

    const newOpps = parsed.opportunities
      .filter((o) => !existingOppIds.has(o.id) && (!o.urlHash || !existingHashes.has(o.urlHash)))
      .map((o) => ({
        ...o, projectIds: o.projectIds.map((pid) => projectIdRemap.get(pid) || pid),
      }));

    const mergedOpps = [...newOpps, ...opportunities];
    const mergedProjs = [...newProjs, ...projects];
    setOpportunities(mergedOpps); setProjects(mergedProjs);
    store.saveOpportunities(mergedOpps); store.saveProjects(mergedProjs);
    return { oppsCount: newOpps.length, projsCount: newProjs.length };
  }, [auth.user, opportunities, projects, store]);

  return {
    isLoaded: true, isCloudSyncing, opportunities, projects: projectsWithCounts, projectsMap, radarDays,
    activeRadarItems, selectedRadarDate, setSelectedRadarDate, availableRadarDates,
    counts, nextCodeNumber, userApiKey, setUserApiKey, isFirebaseReady: auth.isFirebaseReady,
    isGuestContinued, handleContinueAsGuest, user: auth.user, authLoading: auth.authLoading,
    signIn: handleSignIn, signOut: handleSignOut, errorToast, setErrorToast, undoAction, setUndoAction,
    updateOpportunities, handleCreateOpportunity, handleUpdateOpportunity, handleAdvanceStatus,
    handleArchive, handleRestoreOpportunity, handleDeleteOpportunity,
    handleToggleSubTask, handleAddSubTask, handleToggleProjectLink,
    handleAddMultipleSubTasks, handleUpdateApplicationCopy,
    handlePromoteRadarItem, handleToggleVerifyRadarItem, handleAddProject, handleUpdateProject,
    handleDeleteProject, handleImportLocalToAccount, handleClearLocalData, handleResetGuestData,
    handleExportJson, handleImportJson,
  };
}
