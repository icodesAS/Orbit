'use client';

import React, { useState } from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import OpportunityCard from './OpportunityCard';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
}

export default function PipelineTierSection({
  title,
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
}: PipelineTierSectionProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  return (
    <section className="space-y-1">
      {/* Group label row with hairline - no outer box */}
      <button
        type="button"
        onClick={() => setIsSectionOpen((prev) => !prev)}
        className="w-full flex items-center justify-between pb-1 border-b border-line text-left hover:opacity-85 transition-opacity"
      >
        <div className="flex items-center gap-1.5">
          {isSectionOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-ink-3" />
          )}
          <span className="text-xs font-medium text-ink-3">
            {title}
          </span>
        </div>

        <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
          {opportunities.length}
        </span>
      </button>

      {isSectionOpen && (
        <div>
          {opportunities.length === 0 ? (
            <div className="py-3 text-xs text-ink-3">
              No opportunities in this tier.
            </div>
          ) : (
            <div className="divide-y divide-line">
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
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
