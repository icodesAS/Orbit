'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Opportunity,
  OpportunityStatus,
  ArsenalProject,
  RadarItem,
  UndoAction,
} from '@/lib/types';
import {
  INITIAL_OPPORTUNITIES,
  INITIAL_PROJECTS,
  INITIAL_RADAR_ITEMS,
} from '@/lib/initial-data';
import Sidebar, { NavSection } from './Sidebar';
import TodayStrip from './TodayStrip';
import OpportunityCard from './OpportunityCard';
import AskAIDrawer from './AskAIDrawer';
import CommandPalette from './CommandPalette';
import NewOpportunityModal from './NewOpportunityModal';
import { RadarView, ArsenalView, SettingsView } from './SecondaryViews';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  List,
  LayoutGrid,
  RotateCcw,
  X,
} from 'lucide-react';

const TIER_CONFIG: {
  status: OpportunityStatus;
  title: string;
  subtitle: string;
}[] = [
  {
    status: 'active',
    title: 'Active Builds & Submissions',
    subtitle: 'Hard deadlines, active benchmarks, and linked Arsenal deliverables',
  },
  {
    status: 'waitlist',
    title: 'Waitlists & Registration Watch',
    subtitle: 'Closed portals, upcoming cohort windows, and pre-staged dossiers',
  },
  {
    status: 'submitted',
    title: 'Submitted / Pending Verdict',
    subtitle: 'Locked applications with preserved essays and verification hashes',
  },
];

export default function OrbitWorkspace() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    INITIAL_OPPORTUNITIES
  );
  const [projects, setProjects] = useState<ArsenalProject[]>(INITIAL_PROJECTS);
  const [radarItems, setRadarItems] = useState<RadarItem[]>(INITIAL_RADAR_ITEMS);

  const [activeSection, setActiveSection] = useState<NavSection>('pipeline');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collapsible tier state
  const [collapsedTiers, setCollapsedTiers] = useState<Record<string, boolean>>({
    active: false,
    waitlist: false,
    submitted: false,
  });

  // Focus, Expanded sub-tasks, and Scoped Ask AI Drawer state
  const [focusedId, setFocusedId] = useState<string | null>('opp-101');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'opp-101': true,
  });
  const [aiDrawerOppId, setAiDrawerOppId] = useState<string | null>(null);

  // Overlays
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // 5-second Undo Toast
  const [undoToast, setUndoToast] = useState<UndoAction | null>(null);

  const triggerUndoToast = useCallback((message: string, restoreFn: () => void) => {
    const id = `undo-${Date.now()}`;
    setUndoToast({
      id,
      message,
      timestamp: Date.now(),
      restore: restoreFn,
    });
  }, []);

  useEffect(() => {
    if (!undoToast) return;
    const timer = setTimeout(() => {
      setUndoToast((current) => (current?.id === undoToast.id ? null : current));
    }, 5000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  const projectsMap = useMemo(() => {
    const map: Record<string, ArsenalProject> = {};
    projects.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  // Visible pipeline opportunities sorted by soonest deadline
  const visibleOpportunities = useMemo(() => {
    return opportunities
      .filter((o) => o.status !== 'archived')
      .filter((o) => {
        if (projectFilter !== 'all' && !o.projectIds.includes(projectFilter)) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            o.title.toLowerCase().includes(q) ||
            o.organization.toLowerCase().includes(q) ||
            o.code.toLowerCase().includes(q) ||
            o.type.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const tA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const tB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return tA - tB;
      });
  }, [opportunities, projectFilter, searchQuery]);

  // Flat ordered list of visible IDs for J / K keyboard navigation
  const navigableOpportunities = useMemo(() => {
    const ordered: Opportunity[] = [];
    TIER_CONFIG.forEach((tier) => {
      if (!collapsedTiers[tier.status]) {
        visibleOpportunities
          .filter((o) => o.status === tier.status)
          .forEach((o) => ordered.push(o));
      }
    });
    return ordered;
  }, [visibleOpportunities, collapsedTiers]);

  const focusedOpportunity = useMemo(
    () => opportunities.find((o) => o.id === focusedId) || null,
    [opportunities, focusedId]
  );

  const aiDrawerOpportunity = useMemo(
    () => opportunities.find((o) => o.id === aiDrawerOppId) || null,
    [opportunities, aiDrawerOppId]
  );

  // Optimistic Status Advance (S) with 5-second Undo Toast
  const handleAdvanceStatus = useCallback(
    (oppId: string) => {
      const target = opportunities.find((o) => o.id === oppId);
      if (!target) return;

      const prevStatus = target.status;
      const nextStatus: OpportunityStatus =
        prevStatus === 'waitlist'
          ? 'active'
          : prevStatus === 'active'
          ? 'submitted'
          : 'active';

      const prevSnapshot = [...opportunities];

      setOpportunities((curr) =>
        curr.map((o) =>
          o.id === oppId
            ? {
                ...o,
                status: nextStatus,
                progress: nextStatus === 'submitted' ? 100 : o.progress,
                lastActivityAt: 'just now',
                updatedAt: new Date().toISOString(),
              }
            : o
        )
      );

      triggerUndoToast(
        `${target.code} moved to ${
          nextStatus === 'active'
            ? 'Active Builds'
            : nextStatus === 'submitted'
            ? 'Submitted'
            : 'Waitlists'
        }`,
        () => setOpportunities(prevSnapshot)
      );
    },
    [opportunities, triggerUndoToast]
  );

  // Optimistic Archive with 5-second Undo Toast
  const handleArchiveOpportunity = useCallback(
    (oppId: string) => {
      const target = opportunities.find((o) => o.id === oppId);
      if (!target) return;
      const prevSnapshot = [...opportunities];

      setOpportunities((curr) =>
        curr.map((o) =>
          o.id === oppId
            ? { ...o, status: 'archived', lastActivityAt: 'just now' }
            : o
        )
      );

      if (aiDrawerOppId === oppId) {
        setAiDrawerOppId(null);
      }

      triggerUndoToast(`Archived ${target.code} (${target.title})`, () =>
        setOpportunities(prevSnapshot)
      );
    },
    [opportunities, aiDrawerOppId, triggerUndoToast]
  );

  // Optimistic Sub-Task Toggle (instant progress & counter recalculation)
  const handleToggleSubTask = useCallback((oppId: string, taskId: string) => {
    setOpportunities((curr) =>
      curr.map((o) => {
        if (o.id !== oppId) return o;
        const updatedTasks = o.tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        const tasksTotal = updatedTasks.length;
        const tasksDone = updatedTasks.filter((t) => t.done).length;
        const progress =
          tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

        return {
          ...o,
          tasks: updatedTasks,
          tasksDone,
          tasksTotal,
          progress,
          lastActivityAt: 'just now',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Add Sub-Task
  const handleAddSubTask = useCallback((oppId: string, title: string) => {
    setOpportunities((curr) =>
      curr.map((o) => {
        if (o.id !== oppId) return o;
        const newTask = {
          id: `t-${Date.now()}`,
          title,
          done: false,
          sortOrder: o.tasks.length + 1,
          createdAt: new Date().toISOString(),
        };
        const updatedTasks = [...o.tasks, newTask];
        const tasksTotal = updatedTasks.length;
        const tasksDone = updatedTasks.filter((t) => t.done).length;
        const progress =
          tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

        return {
          ...o,
          tasks: updatedTasks,
          tasksDone,
          tasksTotal,
          progress,
          lastActivityAt: 'just now',
        };
      })
    );
  }, []);

  // Optimistic Toggle Project Link (bidirectional usedInCount update)
  const handleToggleProjectLink = useCallback(
    (oppId: string, projectId: string) => {
      const target = opportunities.find((o) => o.id === oppId);
      const proj = projectsMap[projectId];
      if (!target || !proj) return;

      const isCurrentlyLinked = target.projectIds.includes(projectId);

      setOpportunities((curr) =>
        curr.map((o) => {
          if (o.id !== oppId) return o;
          const nextIds = isCurrentlyLinked
            ? o.projectIds.filter((id) => id !== projectId)
            : [...o.projectIds, projectId];
          return {
            ...o,
            projectIds: nextIds,
            lastActivityAt: 'just now',
          };
        })
      );

      setProjects((curr) =>
        curr.map((p) =>
          p.id === projectId
            ? {
                ...p,
                usedInCount: Math.max(
                  0,
                  p.usedInCount + (isCurrentlyLinked ? -1 : 1)
                ),
              }
            : p
        )
      );
    },
    [opportunities, projectsMap]
  );

  // Scoped Ask AI Message Append (strictly inside opportunity document)
  const handleAppendAIMessage = useCallback(
    (
      oppId: string,
      userText: string,
      assistantText: string,
      sources?: { title: string; uri: string }[]
    ) => {
      setOpportunities((curr) =>
        curr.map((o) => {
          if (o.id !== oppId) return o;
          return {
            ...o,
            lastActivityAt: 'just now',
            aiChat: [
              ...o.aiChat,
              {
                id: `m-${Date.now()}-u`,
                role: 'user',
                content: userText,
                createdAt: 'just now',
              },
              {
                id: `m-${Date.now()}-a`,
                role: 'assistant',
                content: assistantText,
                createdAt: 'just now',
                sources,
              },
            ],
          };
        })
      );
    },
    []
  );

  const handleClearAIHistory = useCallback((oppId: string) => {
    setOpportunities((curr) =>
      curr.map((o) => (o.id === oppId ? { ...o, aiChat: [] } : o))
    );
  }, []);

  // Promote 9:00 AM Radar item into Active Pipeline (copies data, keeps radar immutable except promoted flag)
  const handlePromoteRadarItem = useCallback(
    (item: RadarItem) => {
      if (item.promoted) return;
      const now = new Date().toISOString();
      const codeNum = 100 + opportunities.length + 1;
      const newOpp: Opportunity = {
        id: `opp-rad-${Date.now()}`,
        code: `ORB-${codeNum}`,
        title: item.title,
        organization: item.organization,
        type: item.type,
        status: item.type === 'waitlist' ? 'waitlist' : 'active',
        deadline: item.deadline,
        progress: 0,
        tasksDone: 0,
        tasksTotal: 2,
        projectIds: item.recommendedProjectId ? [item.recommendedProjectId] : [],
        url: item.url,
        urlHash: item.urlHash,
        applicationCopy: item.summary,
        notes: `Promoted from 09:00 AM Radar (${item.source})`,
        sourceRadarDate: '2026-11-10',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: 'just now',
        tasks: [
          {
            id: `t-${Date.now()}-1`,
            title: `Verify official deadline and eligibility on ${item.source}`,
            done: item.verified,
            sortOrder: 1,
            createdAt: now,
          },
          {
            id: `t-${Date.now()}-2`,
            title: 'Draft technical submission copy with Scoped Ask AI',
            done: false,
            sortOrder: 2,
            createdAt: now,
          },
        ],
        aiChat: [],
      };

      setOpportunities((prev) => [newOpp, ...prev]);
      setRadarItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, promoted: true } : r))
      );
      setFocusedId(newOpp.id);
      setActiveSection('pipeline');
      triggerUndoToast(
        `Promoted ${newOpp.code} (${newOpp.title}) to Pipeline`,
        () => {
          setOpportunities((prev) => prev.filter((o) => o.id !== newOpp.id));
          setRadarItems((prev) =>
            prev.map((r) => (r.id === item.id ? { ...r, promoted: false } : r))
          );
        }
      );
    },
    [opportunities.length, triggerUndoToast]
  );

  // Global Keyboard Shortcuts (⌘K, N, J, K, A, S, P, E, V, Esc, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Esc closes active overlay or drawer
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isNewModalOpen) {
          setIsNewModalOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (aiDrawerOppId) {
          setAiDrawerOppId(null);
          return;
        }
      }

      // Ignore single-key shortcuts when typing in an input, textarea, or select
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isCommandPaletteOpen || isNewModalOpen) return;

      const key = e.key.toLowerCase();

      if (key === 'n') {
        e.preventDefault();
        setIsNewModalOpen(true);
      } else if (key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (navigableOpportunities.length === 0) return;
        const idx = navigableOpportunities.findIndex((o) => o.id === focusedId);
        const nextIdx =
          idx < 0 ? 0 : Math.min(navigableOpportunities.length - 1, idx + 1);
        setFocusedId(navigableOpportunities[nextIdx].id);
      } else if (key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (navigableOpportunities.length === 0) return;
        const idx = navigableOpportunities.findIndex((o) => o.id === focusedId);
        const prevIdx = idx <= 0 ? 0 : idx - 1;
        setFocusedId(navigableOpportunities[prevIdx].id);
      } else if (key === 'a' && focusedId) {
        e.preventDefault();
        setAiDrawerOppId((curr) => (curr === focusedId ? null : focusedId));
      } else if (key === 's' && focusedId) {
        e.preventDefault();
        handleAdvanceStatus(focusedId);
      } else if ((key === 'e' || e.key === 'Enter') && focusedId) {
        e.preventDefault();
        setExpandedIds((curr) => ({ ...curr, [focusedId]: !curr[focusedId] }));
      } else if (key === 'p' && focusedId && projects.length > 0) {
        e.preventDefault();
        // Cycle or toggle PatchTree link quickly via hotkey
        handleToggleProjectLink(focusedId, projects[0].id);
      } else if (key === 'v') {
        e.preventDefault();
        setViewMode((curr) => (curr === 'list' ? 'board' : 'list'));
      } else if (key === '1') {
        setActiveSection('pipeline');
      } else if (key === '2') {
        setActiveSection('radar');
      } else if (key === '3') {
        setActiveSection('arsenal');
      } else if (key === '4') {
        setActiveSection('settings');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    aiDrawerOppId,
    focusedId,
    handleAdvanceStatus,
    handleToggleProjectLink,
    isCommandPaletteOpen,
    isNewModalOpen,
    isShortcutsModalOpen,
    navigableOpportunities,
    projects,
  ]);

  const unreviewedRadarCount = radarItems.filter((r) => !r.promoted).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0b] text-zinc-100">
      {/* Left Expand-on-Hover Tactical Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        counts={{
          pipeline: opportunities.filter((o) => o.status !== 'archived').length,
          radarUnreviewed: unreviewedRadarCount,
          arsenal: projects.length,
          urgent72h: 3,
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar Contract: 3 Clean Zones separated by gap-8 */}
        <header className="h-12 px-5 border-b border-zinc-800/80 bg-[#0c0c0e] flex items-center justify-between gap-8 shrink-0">
          {/* Zone 1: Single-line Brand / Active Workspace Wordmark */}
          <div className="font-semibold text-sm tracking-tight text-zinc-100 whitespace-nowrap shrink-0">
            Orbit Command Center
          </div>

          {/* Zone 2: Command Palette Search Trigger + Navigation */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full h-8 px-3 rounded bg-[#121216] hover:bg-zinc-900 border border-zinc-800/90 flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors whitespace-nowrap"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">
                  Jump to opportunity, link Arsenal project, or run command...
                </span>
              </span>
              <kbd className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Track</span>
              <kbd className="font-mono text-[10px] text-blue-200 ml-0.5">N</kbd>
            </button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          {activeSection === 'pipeline' && (
            <div className="flex flex-col">
              {/* Pinned "Today" Strip showing items due in the next 72 hours */}
              <TodayStrip
                opportunities={opportunities}
                projectsMap={projectsMap}
                focusedId={focusedId}
                unreviewedRadarCount={unreviewedRadarCount}
                onFocusOpportunity={(id) => {
                  setFocusedId(id);
                  setExpandedIds((curr) => ({ ...curr, [id]: true }));
                }}
                onOpenAskAI={(opp) => {
                  setFocusedId(opp.id);
                  setAiDrawerOppId(opp.id);
                }}
                onAdvanceStatus={handleAdvanceStatus}
                onJumpToRadar={() => setActiveSection('radar')}
              />

              {/* Pipeline Workspace Control Bar (Arsenal Filter + View Mode Toggle + Live Keymap Hint) */}
              <div className="px-5 py-2.5 bg-[#0b0b0d] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                {/* Interactive Arsenal Project Filter Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-900/90 border border-zinc-800/80 rounded">
                    <button
                      type="button"
                      onClick={() => setProjectFilter('all')}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                        projectFilter === 'all'
                          ? 'bg-zinc-800 text-zinc-100 font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      All Tracks ({opportunities.filter((o) => o.status !== 'archived').length})
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setProjectFilter((curr) =>
                            curr === p.id ? 'all' : p.id
                          )
                        }
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
                          projectFilter === p.id
                            ? 'bg-blue-600/25 text-blue-300 border border-blue-500/30 font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>

                  {/* Quick inline filter input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by title or code..."
                    className="h-7 px-2.5 rounded bg-zinc-900/70 border border-zinc-800/80 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 w-44"
                  />
                </div>

                {/* Right: Keyboard Shortcut Legend + List/Board Toggle */}
                <div className="flex items-center gap-4">
                  <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                    <span>
                      <kbd className="text-zinc-300">J</kbd>/
                      <kbd className="text-zinc-300">K</kbd> Navigate
                    </span>
                    <span>·</span>
                    <span>
                      <kbd className="text-zinc-300">A</kbd> Ask AI
                    </span>
                    <span>·</span>
                    <span>
                      <kbd className="text-zinc-300">S</kbd> Advance
                    </span>
                    <span>·</span>
                    <span>
                      <kbd className="text-zinc-300">E</kbd> Tasks
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 p-0.5 bg-zinc-900 border border-zinc-800 rounded">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                        viewMode === 'list'
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('board')}
                      className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                        viewMode === 'board'
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Board</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pipeline Tiers: Structured List View OR 3-Column Board View */}
              {viewMode === 'list' ? (
                <div className="divide-y divide-zinc-800/80">
                  {TIER_CONFIG.map((tier) => {
                    const tierOpps = visibleOpportunities.filter(
                      (o) => o.status === tier.status
                    );
                    const isCollapsed = collapsedTiers[tier.status];
                    const totalTasks = tierOpps.reduce(
                      (acc, o) => acc + o.tasksTotal,
                      0
                    );
                    const doneTasks = tierOpps.reduce(
                      (acc, o) => acc + o.tasksDone,
                      0
                    );

                    return (
                      <section key={tier.status} className="bg-[#0a0a0b]">
                        {/* Collapsible Tier Header */}
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedTiers((curr) => ({
                              ...curr,
                              [tier.status]: !curr[tier.status],
                            }))
                          }
                          className="w-full px-5 py-2.5 bg-[#101014] hover:bg-[#141419] flex items-center justify-between gap-4 transition-colors text-left border-b border-zinc-800/70"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                            )}
                            <h2 className="text-xs font-semibold text-zinc-100 tracking-tight">
                              {tier.title}
                            </h2>
                            <span className="font-mono text-xs text-blue-400 tabular-nums">
                              {tierOpps.length}
                            </span>
                            <span
                              className="hidden sm:inline text-zinc-600"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                            <span className="hidden sm:inline text-xs text-zinc-500 truncate">
                              {tier.subtitle}
                            </span>
                          </div>

                          <div className="font-mono text-[11px] text-zinc-400 tabular-nums shrink-0">
                            {doneTasks}/{totalTasks} tasks complete
                          </div>
                        </button>

                        {/* Tier Cards */}
                        {!isCollapsed && (
                          <div>
                            {tierOpps.length === 0 ? (
                              <div className="px-8 py-6 text-xs text-zinc-500 font-mono">
                                No opportunities in {tier.title}. Press{' '}
                                <kbd className="text-zinc-300">N</kbd> to create
                                a track.
                              </div>
                            ) : (
                              tierOpps.map((opp) => (
                                <OpportunityCard
                                  key={opp.id}
                                  opportunity={opp}
                                  allProjects={projects}
                                  isFocused={focusedId === opp.id}
                                  isExpanded={Boolean(expandedIds[opp.id])}
                                  isSelectedForAI={aiDrawerOppId === opp.id}
                                  viewMode="list"
                                  onFocus={() => setFocusedId(opp.id)}
                                  onToggleExpand={() =>
                                    setExpandedIds((curr) => ({
                                      ...curr,
                                      [opp.id]: !curr[opp.id],
                                    }))
                                  }
                                  onOpenAskAI={() => {
                                    setFocusedId(opp.id);
                                    setAiDrawerOppId((curr) =>
                                      curr === opp.id ? null : opp.id
                                    );
                                  }}
                                  onAdvanceStatus={() =>
                                    handleAdvanceStatus(opp.id)
                                  }
                                  onToggleProjectLink={(projId) =>
                                    handleToggleProjectLink(opp.id, projId)
                                  }
                                  onToggleSubTask={(taskId) =>
                                    handleToggleSubTask(opp.id, taskId)
                                  }
                                  onAddSubTask={(title) =>
                                    handleAddSubTask(opp.id, title)
                                  }
                                  onArchive={() =>
                                    handleArchiveOpportunity(opp.id)
                                  }
                                />
                              ))
                            )}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* 3-Column Kanban Board View */
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {TIER_CONFIG.map((tier) => {
                    const tierOpps = visibleOpportunities.filter(
                      (o) => o.status === tier.status
                    );
                    return (
                      <div
                        key={tier.status}
                        className="rounded bg-[#0d0d11] border border-zinc-800/80 flex flex-col"
                      >
                        <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-100">
                            {tier.title}
                          </span>
                          <span className="font-mono text-xs text-blue-400 tabular-nums">
                            {tierOpps.length}
                          </span>
                        </div>
                        <div className="p-2.5 flex-1">
                          {tierOpps.map((opp) => (
                            <OpportunityCard
                              key={opp.id}
                              opportunity={opp}
                              allProjects={projects}
                              isFocused={focusedId === opp.id}
                              isExpanded={Boolean(expandedIds[opp.id])}
                              isSelectedForAI={aiDrawerOppId === opp.id}
                              viewMode="board"
                              onFocus={() => setFocusedId(opp.id)}
                              onToggleExpand={() =>
                                setExpandedIds((curr) => ({
                                  ...curr,
                                  [opp.id]: !curr[opp.id],
                                }))
                              }
                              onOpenAskAI={() => {
                                setFocusedId(opp.id);
                                setAiDrawerOppId((curr) =>
                                  curr === opp.id ? null : opp.id
                                );
                              }}
                              onAdvanceStatus={() =>
                                handleAdvanceStatus(opp.id)
                              }
                              onToggleProjectLink={(projId) =>
                                handleToggleProjectLink(opp.id, projId)
                              }
                              onToggleSubTask={(taskId) =>
                                handleToggleSubTask(opp.id, taskId)
                              }
                              onAddSubTask={(title) =>
                                handleAddSubTask(opp.id, title)
                              }
                              onArchive={() =>
                                handleArchiveOpportunity(opp.id)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSection === 'radar' && (
            <RadarView
              radarItems={radarItems}
              projectsMap={projectsMap}
              onPromoteRadarItem={handlePromoteRadarItem}
              onToggleVerifyRadarItem={(id) =>
                setRadarItems((curr) =>
                  curr.map((r) =>
                    r.id === id ? { ...r, verified: !r.verified } : r
                  )
                )
              }
            />
          )}

          {activeSection === 'arsenal' && (
            <ArsenalView
              projects={projects}
              onAddProject={(proj) => setProjects((curr) => [...curr, proj])}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              onResetDemo={() => {
                setOpportunities(INITIAL_OPPORTUNITIES);
                setProjects(INITIAL_PROJECTS);
                setRadarItems(INITIAL_RADAR_ITEMS);
                triggerUndoToast('Reset workspace to initial Demo dataset', () => {});
              }}
            />
          )}
        </main>
      </div>

      {/* Right-Side Scoped Ask AI Drawer (~40% width on desktop) */}
      <AskAIDrawer
        opportunity={aiDrawerOpportunity}
        allProjects={projects}
        onClose={() => setAiDrawerOppId(null)}
        onSendMessage={handleAppendAIMessage}
        onClearHistory={handleClearAIHistory}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        opportunities={opportunities}
        projects={projects}
        focusedOpportunity={focusedOpportunity}
        onSelectOpportunity={(opp) => {
          setFocusedId(opp.id);
          setExpandedIds((curr) => ({ ...curr, [opp.id]: true }));
        }}
        onOpenAskAI={(opp) => {
          setFocusedId(opp.id);
          setAiDrawerOppId(opp.id);
        }}
        onAdvanceStatus={handleAdvanceStatus}
        onToggleProjectLink={handleToggleProjectLink}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onSelectSection={setActiveSection}
        onToggleViewMode={() =>
          setViewMode((curr) => (curr === 'list' ? 'board' : 'list'))
        }
      />

      {/* New Opportunity Modal (N) */}
      <NewOpportunityModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        projects={projects}
        nextCodeNumber={100 + opportunities.length + 1}
        onCreate={(newOpp) => {
          setOpportunities((curr) => [newOpp, ...curr]);
          setFocusedId(newOpp.id);
          setExpandedIds((curr) => ({ ...curr, [newOpp.id]: true }));
          triggerUndoToast(`Created ${newOpp.code} (${newOpp.title})`, () =>
            setOpportunities((curr) => curr.filter((o) => o.id !== newOpp.id))
          );
        }}
      />

      {/* Keyboard Shortcuts Reference Modal (?) */}
      {isShortcutsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]"
          onClick={() => setIsShortcutsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg bg-[#111115] border border-zinc-700 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-semibold text-sm text-zinc-100">
                Orbit Keyboard Shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              {[
                ['⌘K / Ctrl+K', 'Command Palette'],
                ['N', 'New Opportunity'],
                ['J / ↓', 'Focus Next Track'],
                ['K / ↑', 'Focus Previous Track'],
                ['A', 'Open Scoped Ask AI'],
                ['S', 'Advance Status'],
                ['E / Enter', 'Expand Sub-tasks'],
                ['P', 'Quick Link Project'],
                ['V', 'Toggle List / Board'],
                ['Esc', 'Close Drawer / Modal'],
              ].map(([k, desc]) => (
                <div
                  key={k}
                  className="flex items-center justify-between p-2 rounded bg-zinc-900/80 border border-zinc-800"
                >
                  <span className="text-zinc-400 font-sans">{desc}</span>
                  <kbd className="text-blue-400">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5-Second Optimistic Undo Toast */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            key={undoToast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.16 }}
            className="fixed bottom-16 md:bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded bg-[#16161c] border border-zinc-700 shadow-2xl text-xs"
          >
            <span className="text-zinc-200 font-mono">{undoToast.message}</span>
            <button
              type="button"
              onClick={() => {
                undoToast.restore();
                setUndoToast(null);
              }}
              className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-mono flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={() => setUndoToast(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
