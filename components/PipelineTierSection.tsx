'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Plus } from 'lucide-react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import OpportunityCard from './OpportunityCard';
import { spring } from '@/lib/motion';

interface PipelineTierSectionProps {
  title: string;
  badge: string;
  opportunities: Opportunity[];
  allProjects: ArsenalProject[];
  focusedId: string | null;
  expandedMap: Record<string, boolean>;
  selectedAiOppId: string | null;
  activeProjectPickerOppId: string | null;
  canUseAi?: boolean;
  onFocusOpportunity: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onOpenEdit: (opp: Opportunity) => void;
  onToggleProjectPicker: (oppId: string) => void;
  onOpenAskAI: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onToggleProjectLink: (oppId: string, projectId: string) => void;
  onToggleSubTask: (oppId: string, taskId: string) => void;
  onAddSubTask: (oppId: string, title: string) => void;
  onArchive: (id: string) => void;
  onDelete?: (id: string) => void;
  onOpenNewModal?: () => void;
}

function TierGlyph({ badge }: { badge: string }) {
  if (badge === 'TIER 1') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" fill="var(--ink)" />
      </svg>
    );
  }
  if (badge === 'TIER 2') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M 7 2 A 5 5 0 0 1 7 12 Z" fill="var(--ink)" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="var(--ink)" strokeWidth="1.4" />
      <path
        d="M4.8 7.2L6.3 8.7L9.3 5.5"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PipelineTierSection({
  title,
  badge,
  opportunities,
  allProjects,
  focusedId,
  expandedMap,
  selectedAiOppId,
  activeProjectPickerOppId,
  canUseAi = false,
  onFocusOpportunity,
  onToggleExpand,
  onOpenEdit,
  onToggleProjectPicker,
  onOpenAskAI,
  onAdvanceStatus,
  onToggleProjectLink,
  onToggleSubTask,
  onAddSubTask,
  onArchive,
  onDelete,
  onOpenNewModal,
}: PipelineTierSectionProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  return (
    <section className="space-y-0.5">
      {/* Sticky collapsible tier header (36px) */}
      <div className="group sticky top-0 z-10 h-9 px-2 bg-canvas/90 backdrop-blur-[6px] border-b border-line flex items-center justify-between">
        <button
          type="button"
          aria-expanded={isSectionOpen}
          onClick={() => setIsSectionOpen((prev) => !prev)}
          className="flex items-center gap-2 text-left flex-1 h-full focus:outline-none"
        >
          <motion.span
            animate={{ rotate: isSectionOpen ? 90 : 0 }}
            transition={spring.snappy}
            className="text-ink-3 flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
          <TierGlyph badge={badge} />
          <span className="text-[13px] font-semibold text-ink">{title}</span>
          <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
            {opportunities.length}
          </span>
        </button>

        {onOpenNewModal && (
          <button
            type="button"
            aria-label="New track (N)"
            title="New track (N)"
            onClick={onOpenNewModal}
            className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isSectionOpen && (
        <div>
          {opportunities.length === 0 ? (
            <div className="h-10 px-6 flex items-center text-[13px] text-ink-3">
              No tracks in this tier
            </div>
          ) : (
            <div className="divide-y divide-line-faint">
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  allProjects={allProjects}
                  isFocused={focusedId === opp.id}
                  isExpanded={Boolean(expandedMap[opp.id])}
                  isSelectedForAI={selectedAiOppId === opp.id}
                  isProjectPickerOpen={activeProjectPickerOppId === opp.id}
                  canUseAi={canUseAi}
                  onFocus={() => onFocusOpportunity(opp.id)}
                  onToggleExpand={() => onToggleExpand(opp.id)}
                  onOpenEdit={() => onOpenEdit(opp)}
                  onToggleProjectPicker={() => onToggleProjectPicker(opp.id)}
                  onOpenAskAI={() => onOpenAskAI(opp)}
                  onAdvanceStatus={() => onAdvanceStatus(opp.id)}
                  onToggleProjectLink={(projId) => onToggleProjectLink(opp.id, projId)}
                  onToggleSubTask={(taskId) => onToggleSubTask(opp.id, taskId)}
                  onAddSubTask={(taskTitle) => onAddSubTask(opp.id, taskTitle)}
                  onArchive={() => onArchive(opp.id)}
                  onDelete={onDelete ? () => onDelete(opp.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
