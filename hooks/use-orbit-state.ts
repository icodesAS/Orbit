import { useState, useMemo, useCallback } from 'react';
import { Opportunity, ArsenalProject, RadarItem, UndoAction, OpportunityStatus } from '@/lib/types';
import { getOrbitStore } from '@/lib/store';
import { getDeadlineInfo } from '@/lib/deadline';

export function useOrbitState() {
  const store = useMemo(() => getOrbitStore(), []);
  const initialState = useMemo(() => store.loadState(), [store]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => initialState.opportunities);
  const [projects, setProjects] = useState<ArsenalProject[]>(() => initialState.projects);
  const [radarDays, setRadarDays] = useState<any[]>(() => initialState.radarDays);
  const [userApiKey, setUserApiKey] = useState('');
  const [isLive, setIsLive] = useState(() => initialState.isLive);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  const projectsMap = useMemo(() => {
    const map: Record<string, ArsenalProject> = {};
    projects.forEach((p) => { map[p.id] = p; });
    return map;
  }, [projects]);

  const activeRadarItems: RadarItem[] = useMemo(() => {
    return radarDays.length > 0 && Array.isArray(radarDays[0].items) ? radarDays[0].items : [];
  }, [radarDays]);

  const counts = useMemo(() => {
    const activePipeline = opportunities.filter((o) => o.status !== 'archived').length;
    const radarUnreviewed = activeRadarItems.filter((i) => !i.promoted).length;
    const urgent72h = opportunities
      .filter((o) => o.status === 'active' || o.status === 'waitlist')
      .filter((o) => getDeadlineInfo(o.deadline, o.status).isUrgent72h).length;

    return { pipeline: activePipeline, radarUnreviewed, arsenal: projects.length, urgent72h };
  }, [opportunities, activeRadarItems, projects]);

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

  const updateOpportunities = useCallback((updater: (prev: Opportunity[]) => Opportunity[]) => {
    setOpportunities((prev) => {
      const next = updater(prev);
      store.saveOpportunities(next);
      return next;
    });
  }, [store]);

  const handleResetDemo = useCallback(() => {
    const nextState = store.resetDemoData();
    setOpportunities(nextState.opportunities);
    setProjects(nextState.projects);
    setRadarDays(nextState.radarDays);
    setIsLive(nextState.isLive);
  }, [store]);

  const handleCreateOpportunity = useCallback((newOpp: Opportunity) => {
    updateOpportunities((prev) => [newOpp, ...prev]);
  }, [updateOpportunities]);

  const handleAdvanceStatus = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    const previousStatus = opp.status;
    let nextStatus: OpportunityStatus = 'active';
    if (previousStatus === 'active') nextStatus = 'submitted';
    else if (previousStatus === 'waitlist') nextStatus = 'active';
    else if (previousStatus === 'submitted') nextStatus = 'active';

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
  }, [opportunities, updateOpportunities]);

  const handleArchive = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    updateOpportunities((prev) =>
      prev.map((o) => o.id === id ? { ...o, status: 'archived' } : o)
    );

    setUndoAction({
      id: `undo-${Date.now()}`,
      message: `Archived ${opp.code}`,
      timestamp: Date.now(),
      restore: () => {
        updateOpportunities((prev) =>
          prev.map((o) => o.id === id ? { ...o, status: opp.status } : o)
        );
      },
    });
  }, [opportunities, updateOpportunities]);

  const handleToggleSubTask = useCallback((oppId: string, taskId: string) => {
    updateOpportunities((prev) =>
      prev.map((o) => {
        if (o.id !== oppId) return o;
        const tasks = o.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
        const done = tasks.filter((t) => t.done).length;
        const total = tasks.length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...o, tasks, tasksDone: done, tasksTotal: total, progress, updatedAt: new Date().toISOString() };
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
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...o, tasks, tasksDone: done, tasksTotal: total, progress, updatedAt: new Date().toISOString() };
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

  const handlePromoteRadarItem = useCallback((item: RadarItem) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      code: `ORB-${String(nextCodeNumber).padStart(2, '0')}`,
      title: item.title,
      organization: item.organization,
      type: item.type,
      status: 'active',
      deadline: item.deadline,
      progress: 0,
      tasksDone: 0,
      tasksTotal: 1,
      projectIds: item.recommendedProjectId ? [item.recommendedProjectId] : [],
      url: item.url,
      urlHash: item.urlHash,
      applicationCopy: item.summary,
      notes: `Promoted from Radar (${todayStr})`,
      sourceRadarDate: todayStr,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: 'just now',
      tasks: [
        {
          id: `t-${Date.now()}`,
          title: 'Confirm program deadline and review deliverables',
          done: false,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      aiChat: [],
    };

    updateOpportunities((prev) => [newOpp, ...prev]);

    setRadarDays((prev) => {
      const next = prev.map((day) => ({
        ...day,
        items: day.items.map((i: RadarItem) => i.id === item.id ? { ...i, promoted: true } : i),
      }));
      store.saveRadarDays(next);
      return next;
    });

    return newOpp.id;
  }, [nextCodeNumber, store, updateOpportunities]);

  const handleToggleVerifyRadarItem = useCallback((itemId: string) => {
    setRadarDays((prev) => {
      const next = prev.map((day) => ({
        ...day,
        items: day.items.map((i: RadarItem) => i.id === itemId ? { ...i, verified: !i.verified } : i),
      }));
      store.saveRadarDays(next);
      return next;
    });
  }, [store]);

  const handleAddProject = useCallback((newProj: ArsenalProject) => {
    setProjects((prev) => {
      const next = [newProj, ...prev];
      store.saveProjects(next);
      return next;
    });
  }, [store]);

  return {
    isLoaded: true,
    opportunities,
    projects,
    projectsMap,
    radarDays,
    activeRadarItems,
    counts,
    nextCodeNumber,
    userApiKey,
    setUserApiKey,
    isLive,
    undoAction,
    setUndoAction,
    updateOpportunities,
    handleResetDemo,
    handleCreateOpportunity,
    handleAdvanceStatus,
    handleArchive,
    handleToggleSubTask,
    handleAddSubTask,
    handleToggleProjectLink,
    handlePromoteRadarItem,
    handleToggleVerifyRadarItem,
    handleAddProject,
  };
}
