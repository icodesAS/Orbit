'use client';

import React from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { isValidHttpsUrl } from '@/lib/url';
import OpportunityTasksList from './OpportunityTasksList';
import { ChevronDown, ChevronRight, ExternalLink, Edit2, Sparkles, ArrowRight } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  allProjects: ArsenalProject[];
  isFocused: boolean;
  isExpanded: boolean;
  isSelectedForAI: boolean;
  isProjectPickerOpen: boolean;
  canUseAi?: boolean;
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

export default function OpportunityCard({
  opportunity,
  allProjects,
  isFocused,
  isExpanded,
  isProjectPickerOpen,
  canUseAi = false,
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
      className={`group transition-colors rounded-md ${
        isFocused ? 'bg-selected' : 'hover:bg-hover'
      }`}
    >
      <div className="py-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
        {/* Left: Expand chevron + Title + Org + Link */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isExpanded ? 'Collapse tasks' : 'Expand tasks'}
            className="p-0.5 text-ink-3 hover:text-ink transition-colors shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {deadlineInfo.heat === 'red' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-urgency-hot shrink-0" />
          ) : deadlineInfo.heat === 'amber' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-urgency-warn shrink-0" />
          ) : null}

          <span className="font-medium text-ink truncate text-[13px]" title={opportunity.title}>
            {opportunity.title}
          </span>

          <span className="text-ink-3 truncate text-xs shrink-0">
            {opportunity.organization}
          </span>

          {opportunity.url && isValidHttpsUrl(opportunity.url) && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open source"
              className="text-ink-3 hover:text-ink transition-colors shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Right: Deadline + Progress + Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto text-xs">
          {linkedProjects.length > 0 && (
            <span className="text-[11px] font-mono text-ink-3 truncate max-w-[120px]">
              {linkedProjects.map((p) => p.title).join(', ')}
            </span>
          )}

          <span className="font-mono text-[11px] text-ink-3 tabular-nums">
            {opportunity.tasksDone}/{opportunity.tasksTotal}
          </span>

          {opportunity.deadline && (
            <span
              className={`font-mono text-[11.5px] tabular-nums ${
                deadlineInfo.heat === 'red'
                  ? 'text-urgency-hot'
                  : deadlineInfo.heat === 'amber'
                  ? 'text-urgency-warn'
                  : 'text-urgency-calm'
              }`}
            >
              {deadlineInfo.relativeLabel}
            </span>
          )}

          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenEdit}
              title="Edit (E)"
              className="p-1 text-ink-3 hover:text-ink transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenAskAI}
              title={canUseAi ? 'Ask AI (A)' : 'Sign in to use AI'}
              className="p-1 text-ink-3 hover:text-ink transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onAdvanceStatus}
              title="Advance status (S)"
              className="p-1 text-ink-3 hover:text-ink transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="pb-2 px-6">
          <OpportunityTasksList
            opportunity={opportunity}
            onToggleSubTask={onToggleSubTask}
            onAddSubTask={onAddSubTask}
            onArchive={onArchive}
          />
        </div>
      )}
    </div>
  );
}
