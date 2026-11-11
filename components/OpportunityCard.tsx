'use client';

import React from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import OpportunityTasksList from './OpportunityTasksList';
import OpportunityHeatChip from './OpportunityHeatChip';
import { Sparkles, ArrowRight, ChevronDown, ChevronRight, ExternalLink, Edit2 } from 'lucide-react';

/**
 * Validates that a URL uses HTTPS protocol
 */
function isValidHttpsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  allProjects: ArsenalProject[];
  isFocused: boolean;
  isExpanded: boolean;
  isSelectedForAI: boolean;
  isProjectPickerOpen: boolean;
  onFocus: () => void;
  onToggleExpand: () => void;
  onOpenEdit: () => void;
  onToggleProjectPicker: () => void;
  onOpenAskAI: () => void;
  onAdvanceStatus: () => void;
  onToggleProjectLink: (projectId: string) => void;
  onToggleSubTask: (taskId: string) => void;
  onAddSubTask: (title: string) => void;
  onArchive: () => void;
}

const STATUS_LABELS: Record<string, string> = { active: 'Active Build', waitlist: 'Watchlist', submitted: 'Submitted' };
const NEXT_STATUS_LABELS: Record<string, string> = { active: 'Mark Submitted', waitlist: 'Promote to Active', submitted: 'Reopen to Active' };

export default function OpportunityCard({
  opportunity,
  allProjects,
  isFocused,
  isExpanded,
  isSelectedForAI,
  isProjectPickerOpen,
  onFocus,
  onToggleExpand,
  onOpenEdit,
  onToggleProjectPicker,
  onOpenAskAI,
  onAdvanceStatus,
  onToggleProjectLink,
  onToggleSubTask,
  onAddSubTask,
  onArchive,
}: OpportunityCardProps) {
  const deadlineInfo = getDeadlineInfo(opportunity.deadline, opportunity.status);

  const linkedProjects = opportunity.projectIds
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter((p): p is ArsenalProject => Boolean(p));

  return (
    <div
      onClick={onFocus}
      className={`group transition-colors ${
        isFocused
          ? 'bg-[#F5F5F3]'
          : isSelectedForAI
          ? 'bg-[#4355B9]/10'
          : 'bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      {/* 12-Column Table Row */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-xs">
        {/* Col 1: Expand Button + Code */}
        <div className="col-span-1 flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isExpanded ? 'Collapse tasks' : 'Expand tasks'}
            className="p-1 rounded text-[#6B7280] hover:text-[#16181D] hover:bg-[#E5E5E1]/60 transition-colors shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          <span
            className={`font-mono text-xs tabular-nums truncate ${
              isFocused ? 'text-[#4355B9] font-semibold' : 'text-[#6B7280]'
            }`}
          >
            {opportunity.code}
          </span>
        </div>

        {/* Col 2: Title, Org, URL & Activity */}
        <div className="col-span-3 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-[#16181D] truncate" title={opportunity.title}>
              {opportunity.title}
            </h3>
            {opportunity.url && isValidHttpsUrl(opportunity.url) && (
              <a
                href={opportunity.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open source portal"
                className="text-[#6B7280] hover:text-[#16181D] transition-colors shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mt-0.5 truncate">
            <span className="font-medium text-[#16181D] truncate">{opportunity.organization}</span>
            <span className="text-[#E5E5E1]">·</span>
            <span className="font-mono text-[10px] shrink-0">{opportunity.lastActivityAt}</span>
          </div>
        </div>

        {/* Col 3: Type */}
        <div className="col-span-1 font-mono text-[11px] text-[#6B7280] capitalize truncate">
          {opportunity.type}
        </div>

        {/* Col 4: Deadline Chip */}
        <div className="col-span-1">
          <OpportunityHeatChip deadlineInfo={deadlineInfo} />
        </div>

        {/* Col 5: Progress Bar */}
        <div className="col-span-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            title="Click or press Enter to inspect tasks"
            className="flex items-center gap-2 w-full group/prog text-left"
          >
            <div className="flex-1 h-1.5 bg-[#E5E5E1] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  opportunity.progress === 100 ? 'bg-[#067647]' : 'bg-[#4355B9]'
                }`}
                style={{ width: `${opportunity.progress}%` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-[#6B7280] group-hover/prog:text-[#16181D] shrink-0">
              {opportunity.tasksDone}/{opportunity.tasksTotal}
            </span>
          </button>
        </div>

        {/* Col 6: Projects & Picker */}
        <div className="col-span-2 relative font-mono text-xs">
          {linkedProjects.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {linkedProjects.map((proj, idx) => (
                <React.Fragment key={proj.id}>
                  {idx > 0 && <span className="text-[#6B7280]">+</span>}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleProjectPicker();
                    }}
                    className="text-[#4355B9] hover:underline transition-colors truncate max-w-[110px] font-medium"
                  >
                    {proj.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleProjectPicker();
              }}
              className="text-[#6B7280] hover:text-[#16181D] text-[11px] transition-colors"
            >
              + link project
            </button>
          )}

          {isProjectPickerOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-7 w-60 rounded-lg bg-white border border-[#E5E5E1] shadow-lg p-2 z-40 text-left"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E5E5E1] text-[11px] text-[#6B7280]">
                <span>Link Arsenal Project</span>
                <button
                  type="button"
                  onClick={onToggleProjectPicker}
                  className="text-[#6B7280] hover:text-[#16181D] font-mono"
                >
                  Esc
                </button>
              </div>
              <div className="space-y-1">
                {allProjects.length === 0 ? (
                  <p className="text-[11px] text-[#6B7280] p-1">No projects in Arsenal.</p>
                ) : (
                  allProjects.map((proj) => {
                    const isLinked = opportunity.projectIds.includes(proj.id);
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => onToggleProjectLink(proj.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                          isLinked
                            ? 'bg-[#4355B9]/10 text-[#4355B9] font-medium'
                            : 'text-[#16181D] hover:bg-[#F5F5F3]'
                        }`}
                      >
                        <span className="truncate">{proj.title}</span>
                        <span className="text-[10px] text-[#6B7280]">
                          {isLinked ? 'LINKED' : 'LINK'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Col 7: Status */}
        <div className="col-span-1 font-mono text-[11px] text-[#6B7280] truncate">
          {STATUS_LABELS[opportunity.status]}
        </div>

        {/* Col 8: Action Buttons (Edit, Link, Ask AI, Advance) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="col-span-1 flex items-center justify-end gap-1 shrink-0"
        >
          <button
            type="button"
            onClick={onOpenEdit}
            title="Edit Opportunity (E)"
            className="p-1 rounded text-[#6B7280] hover:text-[#16181D] hover:bg-[#E5E5E1]/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenAskAI}
            title="Scoped Ask AI (A)"
            className={`p-1 rounded transition-colors ${
              isSelectedForAI
                ? 'bg-[#4355B9] text-white'
                : 'text-[#4355B9] hover:bg-[#4355B9]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onAdvanceStatus}
            title={`${NEXT_STATUS_LABELS[opportunity.status]} (S)`}
            className="p-1 rounded text-[#067647] hover:bg-[#067647]/10 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks Accordion */}
      {isExpanded && (
        <OpportunityTasksList
          opportunity={opportunity}
          onToggleSubTask={onToggleSubTask}
          onAddSubTask={onAddSubTask}
          onArchive={onArchive}
        />
      )}
    </div>
  );
}
