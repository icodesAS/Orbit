'use client';

import { useCallback } from 'react';
import { Opportunity, OpportunityStatus, UndoAction } from '@/lib/types';

interface UseOpportunityActionsProps {
  opportunities: Opportunity[];
  updateOpportunities: (updater: (prev: Opportunity[]) => Opportunity[]) => void;
  setUndoAction: (action: UndoAction | null) => void;
}

export function useOpportunityActions({
  opportunities,
  updateOpportunities,
  setUndoAction,
}: UseOpportunityActionsProps) {
  const handleAdvanceStatus = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    const previousStatus = opp.status;
    let nextStatus: OpportunityStatus = 'active';
    if (previousStatus === 'active') nextStatus = 'submitted';
    else if (previousStatus === 'waitlist' || previousStatus === 'submitted') nextStatus = 'active';

    updateOpportunities((prev) =>
      prev.map((o) => o.id === id ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o)
    );
    setUndoAction({
      id: `undo-${Date.now()}`,
      message: `Updated ${opp.code} status to ${nextStatus}`,
      timestamp: Date.now(),
      restore: () => {
        updateOpportunities((prev) =>
          prev.map((o) => o.id === id ? { ...o, status: previousStatus } : o)
        );
      },
    });
  }, [opportunities, setUndoAction, updateOpportunities]);

  const handleArchive = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    const prevStatus = opp.status;
    updateOpportunities((prev) =>
      prev.map((o) => o.id === id ? { ...o, status: 'archived', updatedAt: new Date().toISOString() } : o)
    );
    setUndoAction({
      id: `undo-${Date.now()}`,
      message: `Archived ${opp.code}`,
      timestamp: Date.now(),
      restore: () => {
        updateOpportunities((prev) =>
          prev.map((o) => o.id === id ? { ...o, status: prevStatus, updatedAt: new Date().toISOString() } : o)
        );
      },
    });
  }, [opportunities, setUndoAction, updateOpportunities]);

  const handleRestoreOpportunity = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    updateOpportunities((prev) =>
      prev.map((o) => o.id === id ? { ...o, status: 'active', updatedAt: new Date().toISOString() } : o)
    );
  }, [opportunities, updateOpportunities]);

  const handleToggleSubTask = useCallback((oppId: string, taskId: string) => {
    updateOpportunities((prev) =>
      prev.map((o) => {
        if (o.id !== oppId) return o;
        const tasks = o.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
        const done = tasks.filter((t) => t.done).length;
        const total = tasks.length;
        return {
          ...o,
          tasks,
          tasksDone: done,
          tasksTotal: total,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [updateOpportunities]);

  const handleAddSubTask = useCallback((oppId: string, title: string) => {
    updateOpportunities((prev) =>
      prev.map((o) => {
        if (o.id !== oppId) return o;
        const newTask = {
          id: `t-${Date.now()}`,
          title,
          done: false,
          sortOrder: o.tasks.length + 1,
          createdAt: new Date().toISOString(),
        };
        const tasks = [...o.tasks, newTask];
        const done = tasks.filter((t) => t.done).length;
        const total = tasks.length;
        return {
          ...o,
          tasks,
          tasksDone: done,
          tasksTotal: total,
          progress: total > 0 ? Math.round((done / total) * 100) : 0,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [updateOpportunities]);

  const handleToggleProjectLink = useCallback((oppId: string, projectId: string) => {
    updateOpportunities((prev) =>
      prev.map((o) => {
        if (o.id !== oppId) return o;
        const exists = o.projectIds.includes(projectId);
        const projectIds = exists ? o.projectIds.filter((id) => id !== projectId) : [...o.projectIds, projectId];
        return { ...o, projectIds, updatedAt: new Date().toISOString() };
      })
    );
  }, [updateOpportunities]);

  return {
    handleAdvanceStatus,
    handleArchive,
    handleRestoreOpportunity,
    handleToggleSubTask,
    handleAddSubTask,
    handleToggleProjectLink,
  };
}
