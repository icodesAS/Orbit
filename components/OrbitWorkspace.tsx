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
    opportunities,
    projects,
    projectsMap,
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
        <SampleDataBanner isLive={isLive} onResetDemo={handleResetDemo} />

        {activeSection === 'pipeline' && (
          <>
            <TodayStrip
              opportunities={opportunities}
              projectsMap={projectsMap}
              focusedId={focusedId}
              unreviewedRadarCount={counts.radarUnreviewed}
              onFocusOpportunity={setSelectedFocusedId}
              onOpenAskAI={setSelectedAiOpp}
              onAdvanceStatus={handleAdvanceStatus}
              onJumpToRadar={() => setActiveSection('radar')}
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-20 md:pb-8">
              <PipelineTierSection
                title="Active Builds & Hard Submissions"
                badge="TIER 1"
                opportunities={activeOpps}
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

              <PipelineTierSection
                title="Waitlists & Registration Watch"
                badge="TIER 2"
                opportunities={waitlistOpps}
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

              <PipelineTierSection
                title="Submitted / Pending Verdict"
                badge="TIER 3"
                opportunities={submittedOpps}
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
            </div>
          </>
        )}

        {activeSection === 'radar' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <RadarView
              radarItems={activeRadarItems}
              projectsMap={projectsMap}
              onPromoteRadarItem={onPromoteAndFocus}
              onToggleVerifyRadarItem={handleToggleVerifyRadarItem}
            />
          </div>
        )}

        {activeSection === 'arsenal' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <ArsenalView projects={projects} onAddProject={handleAddProject} />
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <SettingsView
              userApiKey={userApiKey}
              onUpdateApiKey={setUserApiKey}
              isLive={isLive}
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
        onSendMessage={(oppId, userText, assistantText, sources) => {
          updateOpportunities((prev) =>
            prev.map((o) => {
              if (o.id !== oppId) return o;
              const aiChat = [
                ...o.aiChat,
                { id: `msg-${Date.now()}-u`, role: 'user' as const, content: userText, createdAt: 'just now' },
                { id: `msg-${Date.now()}-a`, role: 'assistant' as const, content: assistantText, createdAt: 'just now', sources },
              ];
              return { ...o, aiChat, updatedAt: new Date().toISOString() };
            })
          );
        }}
        onClearHistory={(oppId) => {
          updateOpportunities((prev) =>
            prev.map((o) => (o.id === oppId ? { ...o, aiChat: [] } : o))
          );
        }}
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
