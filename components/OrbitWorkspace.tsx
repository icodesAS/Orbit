'use client';

import React, { useState, useEffect } from 'react';
import { Opportunity } from '@/lib/types';
import { useOrbitState } from '@/hooks/use-orbit-state';
import Sidebar, { NavSection } from './Sidebar';
import TodayStrip from './TodayStrip';
import SampleDataBanner from './SampleDataBanner';
import PipelineTierSection from './PipelineTierSection';
import RadarView from './RadarView';
import ArsenalView from './ArsenalView';
import SettingsView from './SettingsView';
import CommandPalette from './CommandPalette';
import NewOpportunityModal from './NewOpportunityModal';
import AskAIDrawer from './AskAIDrawer';
import ShortcutsModal from './ShortcutsModal';
import UndoToast from './UndoToast';

export default function OrbitWorkspace() {
  const {
    opportunities, projects, projectsMap, activeRadarItems, counts,
    nextCodeNumber, userApiKey, setUserApiKey, isLive, hasSampleData,
    undoAction, setUndoAction, updateOpportunities, handleResetDemo,
    handleLoadSampleData, handleRemoveSampleData, handleCreateOpportunity,
    handleAdvanceStatus, handleArchive, handleToggleSubTask, handleAddSubTask,
    handleToggleProjectLink, handlePromoteRadarItem, handleToggleVerifyRadarItem,
    handleAddProject,
  } = useOrbitState();

  const [activeSection, setActiveSection] = useState<NavSection>('pipeline');
  const [selectedFocusedId, setSelectedFocusedId] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [selectedAiOpp, setSelectedAiOpp] = useState<Opportunity | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Derived effective focused ID
  const focusedId = selectedFocusedId || opportunities[0]?.id || null;

  const onPromoteAndFocus = (item: any) => {
    const newId = handlePromoteRadarItem(item);
    setActiveSection('pipeline');
    setSelectedFocusedId(newId);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'n') { e.preventDefault(); setIsNewModalOpen(true); }
      else if (key === '1') { e.preventDefault(); setActiveSection('pipeline'); }
      else if (key === '2') { e.preventDefault(); setActiveSection('radar'); }
      else if (key === '3') { e.preventDefault(); setActiveSection('arsenal'); }
      else if (key === '4') { e.preventDefault(); setActiveSection('settings'); }
      else if (key === '?') { e.preventDefault(); setIsShortcutsOpen(true); }
      else if (key === 'escape') {
        setIsCommandPaletteOpen(false);
        setIsNewModalOpen(false);
        setIsShortcutsOpen(false);
        setSelectedAiOpp(null);
      } else if (focusedId) {
        const visible = opportunities.filter((o) => o.status !== 'archived');
        const currentIndex = visible.findIndex((o) => o.id === focusedId);
        if (key === 'j') {
          e.preventDefault();
          const nextIdx = (currentIndex + 1) % visible.length;
          if (visible[nextIdx]) setSelectedFocusedId(visible[nextIdx].id);
        } else if (key === 'k') {
          e.preventDefault();
          const prevIdx = (currentIndex - 1 + visible.length) % visible.length;
          if (visible[prevIdx]) setSelectedFocusedId(visible[prevIdx].id);
        } else if (key === 'enter' || e.code === 'Space') {
          e.preventDefault();
          setExpandedMap((prev) => ({ ...prev, [focusedId]: !prev[focusedId] }));
        } else if (key === 'a') {
          e.preventDefault();
          const opp = opportunities.find((o) => o.id === focusedId);
          if (opp) setSelectedAiOpp(opp);
        } else if (key === 's') {
          e.preventDefault();
          handleAdvanceStatus(focusedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedId, opportunities, handleAdvanceStatus]);

  const activeOpps = opportunities.filter((o) => o.status === 'active');
  const waitlistOpps = opportunities.filter((o) => o.status === 'waitlist');
  const submittedOpps = opportunities.filter((o) => o.status === 'submitted');
  const focusedOpp = opportunities.find((o) => o.id === focusedId) || null;

  const handleAddAiMessage = (oppId: string, userText: string, assistantText: string, sources?: any[]) => {
    updateOpportunities((prev) =>
      prev.map((o) => o.id === oppId ? {
        ...o,
        aiChat: [
          ...o.aiChat,
          { id: `msg-${Date.now()}-u`, role: 'user' as const, content: userText, createdAt: 'just now' },
          { id: `msg-${Date.now()}-a`, role: 'assistant' as const, content: assistantText, createdAt: 'just now', sources },
        ],
        updatedAt: new Date().toISOString(),
      } : o)
    );
  };

  const handleClearAiHistory = (oppId: string) => {
    updateOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, aiChat: [] } : o)));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0d] text-zinc-100 select-none">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        counts={counts}
        isLive={isLive}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <SampleDataBanner
          isLive={isLive}
          hasSampleData={hasSampleData}
          onRemoveSampleData={handleRemoveSampleData}
        />

        {activeSection === 'pipeline' && (
          <>
            <TodayStrip
              opportunities={opportunities}
              projectsMap={projectsMap}
              focusedId={focusedId}
              unreviewedRadarCount={counts.radarUnreviewed}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onFocusOpportunity={setSelectedFocusedId}
              onOpenAskAI={setSelectedAiOpp}
              onAdvanceStatus={handleAdvanceStatus}
              onJumpToRadar={() => setActiveSection('radar')}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onLoadSampleData={handleLoadSampleData}
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-20 md:pb-8">
              {opportunities.length === 0 ? (
                <div className="p-8 text-center rounded border border-zinc-800/80 bg-[#0d0d10] space-y-3 max-w-xl mx-auto my-12">
                  <p className="text-xs text-zinc-400">Your pipeline is empty.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(true)}
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs transition-colors"
                    >
                      Add your first opportunity
                    </button>
                    {!isLive && !hasSampleData && (
                      <button
                        type="button"
                        onClick={handleLoadSampleData}
                        className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-colors"
                      >
                        Load sample data
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                [
                  { title: 'Active Builds & Hard Submissions', badge: 'TIER 1', items: activeOpps },
                  { title: 'Waitlists & Registration Watch', badge: 'TIER 2', items: waitlistOpps },
                  { title: 'Submitted / Pending Verdict', badge: 'TIER 3', items: submittedOpps },
                ].map((tier) => (
                  <PipelineTierSection
                    key={tier.badge}
                    title={tier.title}
                    badge={tier.badge}
                    opportunities={tier.items}
                    allProjects={projects}
                    focusedId={focusedId}
                    expandedMap={expandedMap}
                    selectedAiOppId={selectedAiOpp?.id || null}
                    viewMode={viewMode}
                    onFocusOpportunity={setSelectedFocusedId}
                    onToggleExpand={(id) => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }))}
                    onOpenAskAI={setSelectedAiOpp}
                    onAdvanceStatus={handleAdvanceStatus}
                    onToggleProjectLink={handleToggleProjectLink}
                    onToggleSubTask={handleToggleSubTask}
                    onAddSubTask={handleAddSubTask}
                    onArchive={handleArchive}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeSection === 'radar' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <RadarView
              radarItems={activeRadarItems}
              projectsMap={projectsMap}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onPromoteRadarItem={onPromoteAndFocus}
              onToggleVerifyRadarItem={handleToggleVerifyRadarItem}
              onLoadSampleData={handleLoadSampleData}
            />
          </div>
        )}

        {activeSection === 'arsenal' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <ArsenalView
              projects={projects}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onAddProject={handleAddProject}
              onLoadSampleData={handleLoadSampleData}
            />
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <SettingsView
              userApiKey={userApiKey}
              onUpdateApiKey={setUserApiKey}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onLoadSampleData={handleLoadSampleData}
              onRemoveSampleData={handleRemoveSampleData}
              onResetDemo={handleResetDemo}
            />
          </div>
        )}
      </main>

      <AskAIDrawer
        opportunity={selectedAiOpp}
        allProjects={projects}
        userApiKey={userApiKey}
        onClose={() => setSelectedAiOpp(null)}
        onSendMessage={handleAddAiMessage}
        onClearHistory={handleClearAiHistory}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        opportunities={opportunities}
        projects={projects}
        focusedOpportunity={focusedOpp}
        onSelectOpportunity={(opp) => { setSelectedFocusedId(opp.id); setActiveSection('pipeline'); }}
        onOpenAskAI={(opp) => setSelectedAiOpp(opp)}
        onAdvanceStatus={handleAdvanceStatus}
        onToggleProjectLink={handleToggleProjectLink}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onSelectSection={setActiveSection}
        onToggleViewMode={() => setViewMode((prev) => prev === 'list' ? 'board' : 'list')}
      />

      <NewOpportunityModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        projects={projects}
        nextCodeNumber={nextCodeNumber}
        onCreate={(opp) => { handleCreateOpportunity(opp); setSelectedFocusedId(opp.id); }}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <UndoToast undoAction={undoAction} onUndo={() => { undoAction?.restore(); setUndoAction(null); }} />
    </div>
  );
}
