'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Opportunity, ArsenalProject, RadarItem, UndoAction } from '@/lib/types';
import { getOrbitStore } from '@/lib/store';
import { getDeadlineInfo } from '@/lib/deadline';
import { useOrbitAuth } from './use-orbit-auth';
import { useOpportunityActions } from './use-opportunity-actions';
import {
  subscribeOpportunities,
  subscribeProjects,
  subscribeRadarDays,
  saveOpportunityToFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  updateRadarItemFlagsInFirestore,
  migrateLocalDataToFirestore,
} from '@/lib/liveStore';

export function useOrbitState() {
  const store = useMemo(() => getOrbitStore(), []);
  const initialLocal = useMemo(() => store.loadState(), [store]);
  const auth = useOrbitAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => initialLocal.opportunities);
  const [projects, setProjects] = useState<ArsenalProject[]>(() => initialLocal.projects);
  const [radarDays, setRadarDays] = useState<any[]>(() => initialLocal.radarDays);
  const [userApiKey, setUserApiKey] = useState('');
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [selectedRadarDate, setSelectedRadarDate] = useState<string>('');

  // Real-time Firestore subscriptions when signed in
  useEffect(() => {
    if (!auth.user) return;
    const uid = auth.user.uid;

    const unsubOpps = subscribeOpportunities(uid, (remoteOpps) => {
      setOpportunities(remoteOpps);
    }, (err) => setErrorToast(`Cloud sync error: ${err.message}`));

    const unsubProjs = subscribeProjects(uid, (remoteProjs) => {
      setProjects(remoteProjs);
    }, (err) => setErrorToast(`Cloud projects error: ${err.message}`));

    const unsubRadar = subscribeRadarDays(uid, (remoteDays) => {
      if (remoteDays.length > 0) setRadarDays(remoteDays);
    }, (err) => setErrorToast(`Cloud radar error: ${err.message}`));

    return () => {
      unsubOpps();
      unsubProjs();
      unsubRadar();
    };
  }, [auth.user]);

  const projectsWithCounts = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      usedInCount: opportunities.filter((o) => o.projectIds.includes(p.id)).length,
    }));
  }, [projects, opportunities]);

  const projectsMap = useMemo(() => {
    const map: Record<string, ArsenalProject> = {};
    projectsWithCounts.forEach((p) => { map[p.id] = p; });
    return map;
  }, [projectsWithCounts]);

  const availableRadarDates = useMemo(() => radarDays.map((d: any) => d.date), [radarDays]);
  const activeDay = useMemo(() => {
    if (!radarDays || radarDays.length === 0) return null;
    return (selectedRadarDate && radarDays.find((d: any) => d.date === selectedRadarDate)) || radarDays[0];
  }, [radarDays, selectedRadarDate]);

  const activeRadarItems: RadarItem[] = useMemo(() => {
    return activeDay && Array.isArray(activeDay.items) ? activeDay.items : [];
  }, [activeDay]);

  const counts = useMemo(() => {
    const activePipeline = opportunities.filter((o) => o.status !== 'archived').length;
    const radarUnreviewed = activeRadarItems.filter((i) => !i.promoted).length;
    const urgent72h = opportunities
      .filter((o) => o.status === 'active' || o.status === 'waitlist')
      .filter((o) => getDeadlineInfo(o.deadline, o.status).isUrgent72h).length;

    return { pipeline: activePipeline, radarUnreviewed, arsenal: projects.length, urgent72h };
  }, [opportunities, activeRadarItems, projects]);

  const hasSampleData = useMemo(() => {
    return (
      opportunities.some((o) => o.isSample) ||
      projects.some((p) => p.isSample) ||
      radarDays.some((day) => Array.isArray(day.items) && day.items.some((i: RadarItem) => i.isSample))
    );
  }, [opportunities, projects, radarDays]);

  const nextCodeNumber = useMemo(() => {
    let max = 0;
    opportunities.forEach((o) => {
      const match = o.code.match(/ORB-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return max + 1;
  }, [opportunities]);

  // Optimistic updater with silent rollback on Firestore failure
  const updateOpportunities = useCallback((updater: (prev: Opportunity[]) => Opportunity[]) => {
    setOpportunities((prevSnapshot) => {
      const next = updater(prevSnapshot);
      store.saveOpportunities(next);

      if (auth.user) {
        const uid = auth.user.uid;
        Promise.all(next.map((opp) => saveOpportunityToFirestore(uid, opp))).catch((err) => {
          setOpportunities(prevSnapshot);
          store.saveOpportunities(prevSnapshot);
          setErrorToast(`Sync error. Changes reverted: ${err.message}`);
        });
      }
      return next;
    });
  }, [auth.user, store]);

  const {
    handleAdvanceStatus,
    handleArchive,
    handleToggleSubTask,
    handleAddSubTask,
    handleToggleProjectLink,
  } = useOpportunityActions({ opportunities, updateOpportunities, setUndoAction });

  const handleCreateOpportunity = useCallback((newOpp: Opportunity) => {
    setOpportunities((prevSnapshot) => {
      const next = [newOpp, ...prevSnapshot];
      store.saveOpportunities(next);

      if (auth.user) {
        saveOpportunityToFirestore(auth.user.uid, newOpp).catch((err) => {
          setOpportunities(prevSnapshot);
          store.saveOpportunities(prevSnapshot);
          setErrorToast(`Failed to save opportunity: ${err.message}`);
        });
      }
      return next;
    });
  }, [auth.user, store]);

  const handleUpdateOpportunity = useCallback((updated: Opportunity) => {
    updateOpportunities((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : o))
    );
  }, [updateOpportunities]);

  const handlePromoteRadarItem = useCallback((item: RadarItem, confirmedDeadlineIso?: string, selectedProjectId?: string | null) => {
    const activeDate = activeDay?.date || new Date().toISOString().split('T')[0];
    const projectIds = selectedProjectId !== undefined
      ? (selectedProjectId ? [selectedProjectId] : [])
      : (item.recommendedProjectId ? [item.recommendedProjectId] : []);
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      code: `ORB-${String(nextCodeNumber).padStart(2, '0')}`,
      title: item.title,
      organization: item.organization,
      type: item.type,
      status: 'active',
      deadline: confirmedDeadlineIso || item.deadline,
      progress: 0,
      tasksDone: 0,
      tasksTotal: 1,
      projectIds,
      url: item.url,
      urlHash: item.urlHash,
      applicationCopy: item.summary,
      notes: `Promoted from Radar (${activeDate})`,
      sourceRadarDate: activeDate,
      isSample: Boolean(item.isSample),
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: 'just now',
      tasks: [{ id: `t-${Date.now()}`, title: 'Confirm program deadline and review deliverables', done: false, sortOrder: 1, createdAt: new Date().toISOString() }],
      aiChat: [],
    };
    handleCreateOpportunity(newOpp);
    setRadarDays((prevDays) => {
      const nextDays = prevDays.map((day) => ({
        ...day,
        items: day.items.map((i: RadarItem) => i.id === item.id ? { ...i, promoted: true } : i),
      }));
      store.saveRadarDays(nextDays);

      if (auth.user) {
        updateRadarItemFlagsInFirestore(auth.user.uid, activeDate, item.id, { promoted: true }).catch((err) => {
          setRadarDays(prevDays);
          store.saveRadarDays(prevDays);
          setErrorToast(`Failed to update radar item flag: ${err.message}`);
        });
      }
      return nextDays;
    });
    return newOpp.id;
  }, [activeDay, auth.user, handleCreateOpportunity, nextCodeNumber, store]);

  const handleToggleVerifyRadarItem = useCallback((itemId: string) => {
    const activeDate = activeDay?.date || new Date().toISOString().split('T')[0];
    setRadarDays((prevDays) => {
      let newVerifiedVal = true;
      const nextDays = prevDays.map((day) => ({
        ...day,
        items: day.items.map((i: RadarItem) => {
          if (i.id === itemId) {
            newVerifiedVal = !i.verified;
            return { ...i, verified: newVerifiedVal };
          }
          return i;
        }),
      }));
      store.saveRadarDays(nextDays);

      if (auth.user) {
        updateRadarItemFlagsInFirestore(auth.user.uid, activeDate, itemId, { verified: newVerifiedVal }).catch((err) => {
          setRadarDays(prevDays);
          store.saveRadarDays(prevDays);
          setErrorToast(`Failed to update verification: ${err.message}`);
        });
      }
      return nextDays;
    });
  }, [activeDay, auth.user, store]);

  const handleAddProject = useCallback((newProj: ArsenalProject) => {
    setProjects((prev) => {
      const next = [newProj, ...prev];
      store.saveProjects(next);
      if (auth.user) {
        saveProjectToFirestore(auth.user.uid, newProj).catch((err) => {
          setProjects(prev);
          store.saveProjects(prev);
          setErrorToast(`Failed to save project to cloud: ${err.message}`);
        });
      }
      return next;
    });
  }, [auth.user, store]);

  const handleUpdateProject = useCallback((updated: ArsenalProject) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p));
      store.saveProjects(next);
      if (auth.user) {
        saveProjectToFirestore(auth.user.uid, updated).catch((err) => {
          setProjects(prev);
          store.saveProjects(prev);
          setErrorToast(`Failed to update project: ${err.message}`);
        });
      }
      return next;
    });
  }, [auth.user, store]);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      store.saveProjects(next);
      updateOpportunities((oPrev) =>
        oPrev.map((o) => o.projectIds.includes(projectId) ? { ...o, projectIds: o.projectIds.filter((id) => id !== projectId) } : o)
      );
      if (auth.user) {
        deleteProjectFromFirestore(auth.user.uid, projectId).catch((err) => {
          setProjects(prev);
          store.saveProjects(prev);
          setErrorToast(`Failed to delete project: ${err.message}`);
        });
      }
      return next;
    });
  }, [auth.user, store, updateOpportunities]);

  const handleMigrateDemoToCloud = useCallback(async () => {
    if (!auth.user) throw new Error('Must be signed in to migrate data');
    return migrateLocalDataToFirestore(auth.user.uid, {
      opportunities,
      projects,
    });
  }, [auth.user, opportunities, projects]);

  const handleLoadSampleData = useCallback(async () => {
    const nextState = await store.loadSampleData();
    setOpportunities(nextState.opportunities);
    setProjects(nextState.projects);
    setRadarDays(nextState.radarDays);
  }, [store]);

  const handleRemoveSampleData = useCallback(() => {
    const nextState = store.removeSampleData();
    setOpportunities(nextState.opportunities);
    setProjects(nextState.projects);
    setRadarDays(nextState.radarDays);
  }, [store]);

  const handleResetDemo = useCallback(() => {
    store.saveOpportunities([]);
    store.saveProjects([]);
    store.saveRadarDays([]);
    setOpportunities([]);
    setProjects([]);
    setRadarDays([]);
  }, [store]);

  return {
    isLoaded: true, opportunities, projects: projectsWithCounts, projectsMap, radarDays,
    activeRadarItems, selectedRadarDate, setSelectedRadarDate, availableRadarDates,
    counts, nextCodeNumber, userApiKey, setUserApiKey, isLive: auth.isFirebaseReady,
    user: auth.user, authLoading: auth.authLoading, signIn: auth.signIn, signOut: auth.signOut,
    errorToast, setErrorToast, hasSampleData, undoAction, setUndoAction, updateOpportunities,
    handleResetDemo, handleLoadSampleData, handleRemoveSampleData, handleCreateOpportunity,
    handleUpdateOpportunity, handleAdvanceStatus, handleArchive, handleToggleSubTask,
    handleAddSubTask, handleToggleProjectLink, handlePromoteRadarItem, handleToggleVerifyRadarItem,
    handleAddProject, handleUpdateProject, handleDeleteProject, handleMigrateDemoToCloud,
  };
}
