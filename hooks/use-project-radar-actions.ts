'use client';

import { useCallback } from 'react';
import { Opportunity, ArsenalProject, RadarDay, RadarItem, UndoAction } from '@/lib/types';
import { OrbitDataStore } from '@/lib/store';
import { generateId } from '@/lib/id';
import {
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  updateRadarItemFlagsInFirestore,
} from '@/lib/liveStore';

interface UseProjectRadarActionsProps {
  user: any;
  store: OrbitDataStore;
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  activeDay: RadarDay | null;
  nextCodeNumber: number;
  setProjects: React.Dispatch<React.SetStateAction<ArsenalProject[]>>;
  setRadarDays: React.Dispatch<React.SetStateAction<RadarDay[]>>;
  setUndoAction: (action: UndoAction | null) => void;
  setErrorToast: (msg: string | null) => void;
  updateOpportunities: (updater: (prev: Opportunity[]) => Opportunity[]) => void;
  handleCreateOpportunity: (newOpp: Opportunity) => void;
}

export function useProjectRadarActions({
  user,
  store,
  opportunities,
  projects,
  activeDay,
  nextCodeNumber,
  setProjects,
  setRadarDays,
  setUndoAction,
  setErrorToast,
  updateOpportunities,
  handleCreateOpportunity,
}: UseProjectRadarActionsProps) {
  const handlePromoteRadarItem = useCallback(
    (item: RadarItem, confirmedDeadlineIso?: string, selectedProjectId?: string | null) => {
      const activeDate = activeDay?.date || new Date().toISOString().split('T')[0];
      const projectIds =
        selectedProjectId !== undefined
          ? selectedProjectId
            ? [selectedProjectId]
            : []
          : item.recommendedProjectId
          ? [item.recommendedProjectId]
          : [];
      const now = new Date().toISOString();
      const newOpp: Opportunity = {
        id: generateId('opp'),
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
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: 'just now',
        tasks: [
          {
            id: generateId('task'),
            title: 'Confirm program deadline and review deliverables',
            done: false,
            sortOrder: 1,
            createdAt: now,
          },
        ],
        aiChat: [],
      };
      handleCreateOpportunity(newOpp);
      setRadarDays((prevDays) => {
        const nextDays = prevDays.map((day) => ({
          ...day,
          items: day.items.map((i: RadarItem) => (i.id === item.id ? { ...i, promoted: true } : i)),
        }));
        if (user) {
          updateRadarItemFlagsInFirestore(user.uid, activeDate, item.id, { promoted: true }).catch((err) => {
            setRadarDays(prevDays);
            setErrorToast(`Failed to update radar item flag: ${err.message}`);
          });
        } else {
          store.saveRadarDays(nextDays);
        }
        return nextDays;
      });
      return newOpp.id;
    },
    [activeDay, handleCreateOpportunity, nextCodeNumber, setErrorToast, setRadarDays, store, user]
  );

  const handleToggleVerifyRadarItem = useCallback(
    (itemId: string) => {
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
        if (user) {
          updateRadarItemFlagsInFirestore(user.uid, activeDate, itemId, { verified: newVerifiedVal }).catch((err) => {
            setRadarDays(prevDays);
            setErrorToast(`Failed to update verification: ${err.message}`);
          });
        } else {
          store.saveRadarDays(nextDays);
        }
        return nextDays;
      });
    },
    [activeDay, setErrorToast, setRadarDays, store, user]
  );

  const handleAddProject = useCallback(
    (newProj: ArsenalProject) => {
      setProjects((prev) => {
        const next = [newProj, ...prev];
        if (user) {
          saveProjectToFirestore(user.uid, newProj).catch((err) => {
            setProjects(prev);
            setErrorToast(`Failed to save project: ${err.message}`);
          });
        } else {
          store.saveProjects(next);
        }
        return next;
      });
    },
    [setErrorToast, setProjects, store, user]
  );

  const handleUpdateProject = useCallback(
    (updated: ArsenalProject) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p));
        if (user) {
          saveProjectToFirestore(user.uid, updated).catch((err) => {
            setProjects(prev);
            setErrorToast(`Failed to update project: ${err.message}`);
          });
        } else {
          store.saveProjects(next);
        }
        return next;
      });
    },
    [setErrorToast, setProjects, store, user]
  );

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      const targetProject = projects.find((p) => p.id === projectId);
      if (!targetProject) return;
      const prevProjs = projects;
      const prevOpps = opportunities;

      const nextProjs = projects.filter((p) => p.id !== projectId);
      setProjects(nextProjs);
      if (user) {
        deleteProjectFromFirestore(user.uid, projectId).catch((err) => {
          setProjects(prevProjs);
          setErrorToast(`Failed to delete project: ${err.message}`);
        });
      } else {
        store.saveProjects(nextProjs);
      }

      updateOpportunities((oPrev) =>
        oPrev.map((o) =>
          o.projectIds.includes(projectId)
            ? { ...o, projectIds: o.projectIds.filter((id) => id !== projectId) }
            : o
        )
      );

      setUndoAction({
        id: generateId('undo'),
        message: `Deleted project ${targetProject.title}`,
        timestamp: Date.now(),
        restore: () => {
          setProjects(prevProjs);
          if (user) {
            saveProjectToFirestore(user.uid, targetProject).catch(() => {});
          } else {
            store.saveProjects(prevProjs);
          }
          updateOpportunities(() => prevOpps);
        },
      });
    },
    [opportunities, projects, setErrorToast, setProjects, setUndoAction, store, updateOpportunities, user]
  );

  return {
    handlePromoteRadarItem,
    handleToggleVerifyRadarItem,
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject,
  };
}
