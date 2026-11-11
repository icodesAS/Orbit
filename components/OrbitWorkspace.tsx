'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Opportunity } from '@/lib/types';
import { useOrbitState } from '@/hooks/use-orbit-state';
import Sidebar, { NavSection } from './Sidebar';
import TopBar from './TopBar';
import MobileNavBar from './MobileNavBar';
import TodayView from './TodayView';
import SampleDataBanner from './SampleDataBanner';
import PipelineTierSection from './PipelineTierSection';
import RadarView from './RadarView';
import ArsenalView from './ArsenalView';
import SettingsView from './SettingsView';
import CommandPalette from './CommandPalette';
import NewOpportunityModal from './NewOpportunityModal';
import EditOpportunityModal from './EditOpportunityModal';
import AskAIDrawer from './AskAIDrawer';
import ShortcutsModal from './ShortcutsModal';
import UndoToast from './UndoToast';

export default function OrbitWorkspace() {
  const {
    opportunities, projects, projectsMap, activeRadarItems,
    selectedRadarDate, setSelectedRadarDate, availableRadarDates, counts,
    nextCodeNumber, userApiKey, setUserApiKey, isLive, hasSampleData,
    undoAction, setUndoAction, updateOpportunities, handleResetDemo,
    handleLoadSampleData, handleRemoveSampleData, handleCreateOpportunity,
    handleUpdateOpportunity, handleAdvanceStatus, handleArchive,
    handleToggleSubTask, handleAddSubTask, handleToggleProjectLink,
    handlePromoteRadarItem, handleToggleVerifyRadarItem, handleAddProject,
    handleUpdateProject, handleDeleteProject,
  } = useOrbitState();

  const [activeSection, setActiveSection] = useState<NavSection>('today');
  const [selectedFocusedId, setSelectedFocusedId] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [selectedAiOppId, setSelectedAiOppId] = useState<string | null>(null);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [activeProjectPickerOppId, setActiveProjectPickerOppId] = useState<string | null>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const focusedId = selectedFocusedId || opportunities[0]?.id || null;
  const selectedAiOpp = opportunities.find((o) => o.id === selectedAiOppId) || null;
  const editingOpp = opportunities.find((o) => o.id === editingOppId) || null;

  const onPromoteAndFocus = (item: any, confirmedDeadline?: string | null, selectedProjectId?: string | null) => {
    const newId = handlePromoteRadarItem(item, confirmedDeadline || undefined, selectedProjectId);
    setActiveSection('pipeline');
    setSelectedFocusedId(newId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsNewModalOpen(false);
        setIsShortcutsOpen(false);
        setSelectedAiOppId(null);
        setEditingOppId(null);
        setActiveProjectPickerOppId(null);
        return;
      }

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'n') { e.preventDefault(); setIsNewModalOpen(true); }
      else if (['1', '2', '3', '4'].includes(key)) {
        e.preventDefault();
        const navMap: Record<string, NavSection> = { '1': 'today', '2': 'pipeline', '3': 'radar', '4': 'arsenal' };
        setActiveSection(navMap[key]);
      } else if (key === '?') { e.preventDefault(); setIsShortcutsOpen(true); }
      else if (focusedId) {
        const visible = opportunities.filter((o) => o.status !== 'archived');
        const curr = visible.findIndex((o) => o.id === focusedId);
        if (key === 'j') { e.preventDefault(); const n = (curr + 1) % visible.length; if (visible[n]) setSelectedFocusedId(visible[n].id); }
        else if (key === 'k') { e.preventDefault(); const p = (curr - 1 + visible.length) % visible.length; if (visible[p]) setSelectedFocusedId(visible[p].id); }
        else if (key === 'enter' || e.code === 'Space') { e.preventDefault(); setExpandedMap((prev) => ({ ...prev, [focusedId]: !prev[focusedId] })); }
        else if (key === 'e') { e.preventDefault(); setEditingOppId(focusedId); }
        else if (key === 'p') { e.preventDefault(); setActiveProjectPickerOppId((prev) => (prev === focusedId ? null : focusedId)); }
        else if (key === 'a') { e.preventDefault(); setSelectedAiOppId(focusedId); }
        else if (key === 's') { e.preventDefault(); handleAdvanceStatus(focusedId); }
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
    updateOpportunities((prev) => prev.map((o) => o.id === oppId ? {
      ...o,
      aiChat: [...o.aiChat, { id: `msg-${Date.now()}-u`, role: 'user' as const, content: userText, createdAt: 'just now' }, { id: `msg-${Date.now()}-a`, role: 'assistant' as const, content: assistantText, createdAt: 'just now', sources }],
      updatedAt: new Date().toISOString(),
    } : o));
  };
  const handleClearAiHistory = (oppId: string) => {
    updateOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, aiChat: [] } : o)));
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F5F3] text-[#16181D] font-sans select-none">
      <Sidebar
        activeSection={activeSection} onSelectSection={setActiveSection} counts={counts} isLive={isLive}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F5F5F3]">
        <TopBar
          opportunities={opportunities}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onJumpToOpportunity={(id) => { setSelectedFocusedId(id); setActiveSection('pipeline'); }}
        />

        <SampleDataBanner isLive={isLive} hasSampleData={hasSampleData} onRemoveSampleData={handleRemoveSampleData} />

        {activeSection === 'today' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <TodayView
              opportunities={opportunities}
              projectsMap={projectsMap}
              focusedId={focusedId}
              unreviewedRadarCount={counts.radarUnreviewed}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onFocusOpportunity={setSelectedFocusedId}
              onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)}
              onAdvanceStatus={handleAdvanceStatus}
              onJumpToRadar={() => setActiveSection('radar')}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onLoadSampleData={handleLoadSampleData}
            />
          </div>
        )}

        {activeSection === 'pipeline' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-20 md:pb-8">
            {opportunities.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-[#E5E5E1] bg-white space-y-3 max-w-xl mx-auto my-12 shadow-2xs">
                <p className="text-xs text-[#6B7280]">Your pipeline is empty.</p>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setIsNewModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white font-mono text-xs transition-colors shadow-2xs">
                    Add your first opportunity
                  </button>
                  {!isLive && !hasSampleData && (
                    <button type="button" onClick={handleLoadSampleData} className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs transition-colors shadow-2xs">
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
                  selectedAiOppId={selectedAiOppId}
                  activeProjectPickerOppId={activeProjectPickerOppId}
                  onFocusOpportunity={setSelectedFocusedId}
                  onToggleExpand={(id) => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }))}
                  onOpenEdit={(opp) => setEditingOppId(opp.id)}
                  onToggleProjectPicker={(id) => setActiveProjectPickerOppId((prev) => (prev === id ? null : id))}
                  onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)}
                  onAdvanceStatus={handleAdvanceStatus}
                  onToggleProjectLink={handleToggleProjectLink}
                  onToggleSubTask={handleToggleSubTask}
                  onAddSubTask={handleAddSubTask}
                  onArchive={handleArchive}
                />
              ))
            )}
          </div>
        )}

        {activeSection === 'radar' && (
          <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <RadarView
              radarItems={activeRadarItems}
              projectsMap={projectsMap}
              allProjects={projects}
              availableDates={availableRadarDates}
              selectedDate={selectedRadarDate}
              onSelectDate={setSelectedRadarDate}
              isLive={isLive}
              hasSampleData={hasSampleData}
              onConfirmTrack={onPromoteAndFocus}
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
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
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

      <MobileNavBar activeSection={activeSection} onSelectSection={setActiveSection} counts={counts} />

      <AskAIDrawer
        opportunity={selectedAiOpp}
        allProjects={projects}
        userApiKey={userApiKey}
        onClose={() => setSelectedAiOppId(null)}
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
        onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)}
        onOpenEdit={(opp) => setEditingOppId(opp.id)}
        onAdvanceStatus={handleAdvanceStatus}
        onToggleProjectLink={handleToggleProjectLink}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onSelectSection={setActiveSection}
      />

      <NewOpportunityModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        projects={projects}
        nextCodeNumber={nextCodeNumber}
        onCreate={(opp) => { handleCreateOpportunity(opp); setSelectedFocusedId(opp.id); }}
      />

      <EditOpportunityModal
        isOpen={Boolean(editingOpp)}
        opportunity={editingOpp}
        onClose={() => setEditingOppId(null)}
        onSave={handleUpdateOpportunity}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <UndoToast undoAction={undoAction} onUndo={() => { undoAction?.restore(); setUndoAction(null); }} />
    </div>
  );
}
