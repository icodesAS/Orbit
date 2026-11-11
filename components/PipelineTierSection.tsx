'use client';

import React, { useState } from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import OpportunityCard from './OpportunityCard';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';

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
}: PipelineTierSectionProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  return (
    <section className="border border-[#E5E5E1] rounded-lg bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={() => setIsSectionOpen((prev) => !prev)}
        className="w-full px-4 py-2.5 bg-[#F5F5F3] border-b border-[#E5E5E1] flex items-center justify-between hover:bg-[#ECECE8] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isSectionOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
          )}
          <span className="text-xs font-semibold text-[#16181D] tracking-wide">
            {title}
          </span>
          <span className="font-mono text-[10px] text-[#6B7280] px-1.5 py-0.5 rounded bg-white border border-[#E5E5E1]">
            {badge}
          </span>
        </div>

        <span className="font-mono text-[11px] text-[#6B7280] tabular-nums">
          {opportunities.length} {opportunities.length === 1 ? 'item' : 'items'}
        </span>
      </button>

      {isSectionOpen && (
        <div className="overflow-x-auto">
          {opportunities.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7280] font-mono">
              <Layers className="w-4 h-4 mx-auto mb-1.5 text-[#6B7280]" />
              <span>No opportunities in this tier.</span>
            </div>
          ) : (
            <div className="min-w-[960px] divide-y divide-[#E5E5E1]">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#FAFAFA] border-b border-[#E5E5E1] text-[11px] font-mono text-[#6B7280] font-medium items-center">
                <div className="col-span-1">CODE</div>
                <div className="col-span-3">TITLE & SOURCE</div>
                <div className="col-span-1">TYPE</div>
                <div className="col-span-1">DEADLINE</div>
                <div className="col-span-2">PROGRESS</div>
                <div className="col-span-2">PROJECTS</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-1 text-right">ACTIONS</div>
              </div>

              {/* Table Rows */}
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
