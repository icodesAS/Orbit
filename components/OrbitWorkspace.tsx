'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { useOrbitState } from '@/hooks/use-orbit-state';
import Sidebar, { NavSection } from './Sidebar';
import TopBar from './TopBar';
import MobileNavBar from './MobileNavBar';
import SignInScreen from './SignInScreen';
import TodayView from './TodayView';
import PipelineTierSection from './PipelineTierSection';
import ArchivedSection from './ArchivedSection';
import RadarView from './RadarView';
import ArsenalView from './ArsenalView';
import SettingsView from './SettingsView';
import CommandPalette from './CommandPalette';
import NewOpportunityModal from './NewOpportunityModal';
import EditOpportunityModal from './EditOpportunityModal';
import AskAIDrawer from './AskAIDrawer';
import ShortcutsModal from './ShortcutsModal';
import UndoToast from './UndoToast';
import ErrorToast from './ErrorToast';
import { OrbitGlyph } from './OrbitGlyph';
import { dur, ease, fadeUp, spring, stagger } from '@/lib/motion';

export default function OrbitWorkspace() {
  const {
    isCloudSyncing, opportunities, projects, projectsMap, activeRadarItems,
    selectedRadarDate, setSelectedRadarDate, availableRadarDates, counts,
    nextCodeNumber, userApiKey, setUserApiKey, isFirebaseReady,
    isGuestContinued, handleContinueAsGuest, user, authLoading,
    signIn, signOut, errorToast, setErrorToast, undoAction, setUndoAction,
    updateOpportunities, handleCreateOpportunity, handleUpdateOpportunity,
    handleAdvanceStatus, handleArchive, handleRestoreOpportunity, handleDeleteOpportunity,
    handleToggleSubTask, handleAddSubTask, handleToggleProjectLink,
    handleAddMultipleSubTasks, handleUpdateApplicationCopy,
    handlePromoteRadarItem, handleToggleVerifyRadarItem,
    handleAddProject, handleUpdateProject, handleDeleteProject,
    handleImportLocalToAccount, handleClearLocalData, handleResetGuestData,
    handleExportJson, handleImportJson,
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
  const visibleOpps = opportunities.filter((o) => o.status !== 'archived');
  const archivedOpps = opportunities.filter((o) => o.status === 'archived');
  const focusedId = selectedFocusedId || visibleOpps[0]?.id || null;
  const selectedAiOpp = opportunities.find((o) => o.id === selectedAiOppId) || null;
  const editingOpp = opportunities.find((o) => o.id === editingOppId) || null;
  const canUseAi = Boolean(user) || !isFirebaseReady;

  const onPromoteAndFocus = (item: any, confirmedDeadline?: string | null, selectedProjectId?: string | null) => {
    const newId = handlePromoteRadarItem(item, confirmedDeadline || undefined, selectedProjectId);
    setActiveSection('pipeline');
    setSelectedFocusedId(newId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsNewModalOpen(false);
        setIsShortcutsOpen(false);
        setSelectedAiOppId(null);
        setEditingOppId(null);
        setActiveProjectPickerOppId(null);
        return;
      }

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' || tag === 'textarea' || tag === 'select' ||
        tag === 'button' || target?.closest('button') || target?.getAttribute('role') === 'button' ||
        target?.isContentEditable || target?.closest('[role="dialog"]') || target?.closest('[role="listbox"]')
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'n') { e.preventDefault(); setIsNewModalOpen(true); }
      else if (['1', '2', '3', '4'].includes(key)) {
        e.preventDefault();
        const navMap: Record<string, NavSection> = { '1': 'today', '2': 'pipeline', '3': 'radar', '4': 'arsenal' };
        setActiveSection(navMap[key]);
      } else if (key === '?') { e.preventDefault(); setIsShortcutsOpen(true); }
      else if (activeSection === 'pipeline' && focusedId) {
        const visible = opportunities.filter((o) => o.status !== 'archived');
        const curr = visible.findIndex((o) => o.id === focusedId);
        if (key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          const n = (curr + 1) % Math.max(1, visible.length);
          if (visible[n]) setSelectedFocusedId(visible[n].id);
        } else if (key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          const p = (curr - 1 + visible.length) % Math.max(1, visible.length);
          if (visible[p]) setSelectedFocusedId(visible[p].id);
        } else if (key === 'enter' || e.code === 'Space') {
          e.preventDefault();
          setExpandedMap((prev) => ({ ...prev, [focusedId]: !prev[focusedId] }));
        } else if (key === 'e') { e.preventDefault(); setEditingOppId(focusedId); }
        else if (key === 'p') { e.preventDefault(); setActiveProjectPickerOppId((prev) => (prev === focusedId ? null : focusedId)); }
        else if (key === 'a') { e.preventDefault(); setSelectedAiOppId(focusedId); }
        else if (key === 's') { e.preventDefault(); handleAdvanceStatus(focusedId); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedId, opportunities, handleAdvanceStatus, activeSection]);

  const activeOpps = opportunities.filter((o) => o.status === 'active');
  const waitlistOpps = opportunities.filter((o) => o.status === 'waitlist');
  const submittedOpps = opportunities.filter((o) => o.status === 'submitted');
  const focusedOpp = opportunities.find((o) => o.id === focusedId) || null;

  const handleAddAiMessage = (oppId: string, userText: string, assistantText: string, sources?: any[]) => {
    const nowIso = new Date().toISOString();
    updateOpportunities((prev) => prev.map((o) => o.id === oppId ? {
      ...o,
      aiChat: [
        ...o.aiChat,
        { id: `msg-${Date.now()}-u`, role: 'user' as const, content: userText, createdAt: nowIso },
        { id: `msg-${Date.now()}-a`, role: 'assistant' as const, content: assistantText, createdAt: nowIso, sources },
      ],
      updatedAt: nowIso,
    } : o));
  };

  const handleClearAiHistory = (oppId: string) => {
    updateOpportunities((prev) => prev.map((o) => (o.id === oppId ? { ...o, aiChat: [] } : o)));
  };

  if (!isMounted) return null;

  if (isFirebaseReady && !user && !isGuestContinued) {
    return (
      <MotionConfig reducedMotion="user" transition={spring.smooth}>
        <SignInScreen onSignIn={signIn} onContinueAsGuest={handleContinueAsGuest} authLoading={authLoading} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user" transition={spring.smooth}>
      <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink font-sans select-none">
        <Sidebar
          activeSection={activeSection} onSelectSection={setActiveSection} counts={counts}
          isSignedIn={Boolean(user)} userName={user?.displayName || user?.email}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-canvas">
          <TopBar
            opportunities={opportunities} isGuest={!user}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onJumpToOpportunity={(id) => { setSelectedFocusedId(id); setActiveSection('pipeline'); }}
          />

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } }}
            className="flex-1 overflow-y-auto pb-20 md:pb-8"
          >
            {activeSection === 'today' && (
              <TodayView
                opportunities={opportunities} projectsMap={projectsMap} focusedId={focusedId}
                unreviewedRadarCount={counts.radarUnreviewed} canUseAi={canUseAi} isSyncing={isCloudSyncing}
                onFocusOpportunity={setSelectedFocusedId} onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)}
                onOpenEdit={(opp) => setEditingOppId(opp.id)} onAdvanceStatus={handleAdvanceStatus}
                onJumpToRadar={() => setActiveSection('radar')} onJumpToPipeline={() => setActiveSection('pipeline')}
                onOpenNewModal={() => setIsNewModalOpen(true)}
              />
            )}

            {activeSection === 'pipeline' && (
              <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-line">
                  <div>
                    <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.022em] text-ink">Pipeline</h1>
                    <p className="text-[13.5px] text-ink-2 mt-1">Active builds, waitlist watch and submitted tracks.</p>
                  </div>
                  <button type="button" onClick={() => setIsNewModalOpen(true)} className="btn btn-secondary self-start sm:self-auto">
                    <span>New track</span><span className="kbd">N</span>
                  </button>
                </div>

                {isCloudSyncing && visibleOpps.length === 0 ? (
                  <div className="space-y-2 pt-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[44px] rounded-[8px] bg-raised border border-line animate-pulse" />
                    ))}
                  </div>
                ) : visibleOpps.length === 0 ? (
                  <motion.div variants={stagger(0.06, 0.04)} initial="hidden" animate="show" className="min-h-[360px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
                    <motion.div variants={fadeUp}><OrbitGlyph size="lg" /></motion.div>
                    <motion.h2 variants={fadeUp} className="text-[15px] font-semibold text-ink tracking-[-0.01em] mt-1">Your pipeline is empty</motion.h2>
                    <motion.p variants={fadeUp} className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed">Create your first track or promote an opportunity from Radar.</motion.p>
                    <motion.div variants={fadeUp} className="pt-2">
                      <button type="button" onClick={() => setIsNewModalOpen(true)} className="btn btn-primary"><span>New track</span><span className="kbd">N</span></button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {[
                      { title: 'Active Build (Tier 1)', badge: 'TIER 1', items: activeOpps },
                      { title: 'Waitlist Watch (Tier 2)', badge: 'TIER 2', items: waitlistOpps },
                      { title: 'Submitted (Tier 3)', badge: 'TIER 3', items: submittedOpps },
                    ].map((tier) => (
                      <PipelineTierSection
                        key={tier.badge} title={tier.title} badge={tier.badge} opportunities={tier.items}
                        allProjects={projects} focusedId={focusedId} expandedMap={expandedMap}
                        selectedAiOppId={selectedAiOppId} activeProjectPickerOppId={activeProjectPickerOppId}
                        canUseAi={canUseAi} onFocusOpportunity={setSelectedFocusedId}
                        onToggleExpand={(id) => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }))}
                        onOpenEdit={(opp) => setEditingOppId(opp.id)}
                        onToggleProjectPicker={(id) => setActiveProjectPickerOppId((prev) => (prev === id ? null : id))}
                        onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)} onAdvanceStatus={handleAdvanceStatus}
                        onToggleProjectLink={handleToggleProjectLink} onToggleSubTask={handleToggleSubTask}
                        onAddSubTask={handleAddSubTask} onArchive={handleArchive} onDelete={handleDeleteOpportunity}
                        onOpenNewModal={() => setIsNewModalOpen(true)}
                      />
                    ))}
                  </div>
                )}

                <ArchivedSection
                  archivedOpportunities={archivedOpps}
                  onRestore={handleRestoreOpportunity}
                  onDeletePermanently={handleDeleteOpportunity}
                />
              </div>
            )}

            {activeSection === 'radar' && (
              <RadarView
                radarItems={activeRadarItems} projectsMap={projectsMap} allProjects={projects}
                availableDates={availableRadarDates} selectedDate={selectedRadarDate || availableRadarDates[0] || ''}
                onSelectDate={setSelectedRadarDate} isSignedIn={Boolean(user)}
                onConfirmTrack={onPromoteAndFocus} onToggleVerifyRadarItem={handleToggleVerifyRadarItem}
              />
            )}

            {activeSection === 'arsenal' && (
              <ArsenalView projects={projects} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} />
            )}

            {activeSection === 'settings' && (
              <SettingsView
                userApiKey={userApiKey} onUpdateApiKey={setUserApiKey} isFirebaseReady={isFirebaseReady}
                user={user} authLoading={authLoading} opportunitiesCount={opportunities.length} projectsCount={projects.length}
                onSignIn={signIn} onSignOut={signOut} onImportLocalToAccount={handleImportLocalToAccount}
                onClearLocalData={handleClearLocalData} onResetGuestData={handleResetGuestData} onExportJson={handleExportJson} onImportJson={handleImportJson}
              />
            )}
          </motion.div>
        </main>

        <MobileNavBar activeSection={activeSection} onSelectSection={setActiveSection} counts={counts} />
        <AskAIDrawer
          opportunity={selectedAiOpp} allProjects={projects} userApiKey={userApiKey}
          firebaseUser={user} canUseAi={canUseAi} onSignIn={signIn} onClose={() => setSelectedAiOppId(null)}
          onSendMessage={handleAddAiMessage} onClearHistory={handleClearAiHistory}
          onApplyTasks={(tasks) => selectedAiOpp && handleAddMultipleSubTasks(selectedAiOpp.id, tasks)}
          onApplyCopy={(copy) => selectedAiOpp && handleUpdateApplicationCopy(selectedAiOpp.id, copy)}
        />
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} opportunities={opportunities} projects={projects} focusedOpportunity={focusedOpp} onSelectOpportunity={(opp) => { setSelectedFocusedId(opp.id); setActiveSection('pipeline'); }} onOpenAskAI={(opp) => setSelectedAiOppId(opp.id)} onOpenEdit={(opp) => setEditingOppId(opp.id)} onAdvanceStatus={handleAdvanceStatus} onToggleProjectLink={handleToggleProjectLink} onOpenNewModal={() => setIsNewModalOpen(true)} onSelectSection={setActiveSection} />
        <NewOpportunityModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} projects={projects} nextCodeNumber={nextCodeNumber} onCreate={(opp) => { handleCreateOpportunity(opp); setSelectedFocusedId(opp.id); }} />
        <EditOpportunityModal isOpen={Boolean(editingOpp)} opportunity={editingOpp} onClose={() => setEditingOppId(null)} onSave={handleUpdateOpportunity} />
        <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
        <UndoToast undoAction={undoAction} onUndo={() => { undoAction?.restore(); setUndoAction(null); }} onDismiss={() => setUndoAction(null)} />
        <ErrorToast message={errorToast} onDismiss={() => setErrorToast(null)} />
      </div>
    </MotionConfig>
  );
}
