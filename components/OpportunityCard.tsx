'use client';

import React, { useState } from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import OpportunityTasksList from './OpportunityTasksList';
import OpportunityHeatChip from './OpportunityHeatChip';
import {
  Sparkles,
  Link2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  allProjects: ArsenalProject[];
  isFocused: boolean;
  isExpanded: boolean;
  isSelectedForAI: boolean;
  viewMode: 'list' | 'board';
  onFocus: () => void;
  onToggleExpand: () => void;
  onOpenAskAI: () => void;
  onAdvanceStatus: () => void;
  onToggleProjectLink: (projectId: string) => void;
  onToggleSubTask: (taskId: string) => void;
  onAddSubTask: (title: string) => void;
  onArchive: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active Build',
  waitlist: 'Watchlist',
  submitted: 'Submitted',
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  active: 'Mark Submitted',
  waitlist: 'Promote to Active',
  submitted: 'Reopen to Active',
};

export default function OpportunityCard({
  opportunity,
  allProjects,
  isFocused,
  isExpanded,
  isSelectedForAI,
  viewMode,
  onFocus,
  onToggleExpand,
  onOpenAskAI,
  onAdvanceStatus,
  onToggleProjectLink,
  onToggleSubTask,
  onAddSubTask,
  onArchive,
}: OpportunityCardProps) {
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const deadlineInfo = getDeadlineInfo(opportunity.deadline, opportunity.status);

  const linkedProjects = opportunity.projectIds
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter((p): p is ArsenalProject => Boolean(p));

  return (
    <div
      onClick={onFocus}
      className={`group relative transition-colors border-b border-zinc-800/80 last:border-b-0 ${
        viewMode === 'board' ? 'rounded border border-zinc-800/80 mb-2 bg-[#111114]' : ''
      } ${
        isFocused ? 'bg-[#15161c]' : isSelectedForAI ? 'bg-blue-950/15' : 'bg-[#0d0d10] hover:bg-[#121216]'
      }`}
    >
      <div
        className={`px-4 py-2.5 flex ${
          viewMode === 'board'
            ? 'flex-col gap-2.5'
            : 'flex-col xl:flex-row xl:items-center justify-between gap-3'
        }`}
      >
        <div className="flex items-start xl:items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            aria-label={isExpanded ? 'Collapse tasks' : 'Expand tasks'}
            className="mt-0.5 xl:mt-0 p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono text-xs tabular-nums whitespace-nowrap shrink-0 ${isFocused ? 'text-blue-400 font-semibold' : 'text-zinc-500'}`}>
                {opportunity.code}
              </span>
              <h3 className="text-sm font-medium text-zinc-100 truncate">
                {opportunity.title}
              </h3>
              {opportunity.url && (
                <a
                  href={opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open source portal"
                  className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
              <span className="text-zinc-300 font-medium">{opportunity.organization}</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[11px] text-zinc-400">{opportunity.type}</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[11px] text-zinc-400">{STATUS_LABELS[opportunity.status]}</span>
              <span className="text-zinc-600">·</span>
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                updated {opportunity.lastActivityAt}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center ${
            viewMode === 'board'
              ? 'justify-between flex-wrap gap-2 pt-2 border-t border-zinc-800/60'
              : 'justify-between xl:justify-end gap-4 pl-6 xl:pl-0'
          }`}
        >
          <div className="relative flex items-center gap-1.5 font-mono text-xs">
            {linkedProjects.length > 0 ? (
              <div className="flex items-center gap-1.5 text-blue-300/90">
                {linkedProjects.map((proj, idx) => (
                  <React.Fragment key={proj.id}>
                    {idx > 0 && <span className="text-zinc-600">+</span>}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowProjectPicker((prev) => !prev); }}
                      className="hover:text-blue-200 hover:underline transition-colors whitespace-nowrap shrink-0"
                    >
                      {proj.title}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowProjectPicker((prev) => !prev); }}
                className="text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors whitespace-nowrap shrink-0"
              >
                + link project
              </button>
            )}

            {showProjectPicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-60 rounded bg-[#16161a] border border-zinc-700/90 shadow-2xl p-2 z-40"
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span>Link Arsenal Project</span>
                  <button type="button" onClick={() => setShowProjectPicker(false)} className="text-zinc-500 hover:text-zinc-200 font-mono">
                    Esc
                  </button>
                </div>
                <div className="space-y-1">
                  {allProjects.map((proj) => {
                    const isLinked = opportunity.projectIds.includes(proj.id);
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => onToggleProjectLink(proj.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                          isLinked ? 'bg-blue-500/15 text-blue-300' : 'text-zinc-300 hover:bg-zinc-800/80'
                        }`}
                      >
                        <span className="truncate">{proj.title}</span>
                        <span className="text-[10px] text-zinc-400">{isLinked ? 'LINKED' : 'LINK'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            title="Click to inspect & toggle sub-tasks"
            className="flex items-center gap-2 shrink-0 group/prog"
          >
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  opportunity.progress === 100 ? 'bg-emerald-400' : 'bg-blue-500'
                }`}
                style={{ width: `${opportunity.progress}%` }}
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-zinc-300 group-hover/prog:text-white">
              {opportunity.tasksDone}/{opportunity.tasksTotal}
            </span>
          </button>

          <OpportunityHeatChip deadlineInfo={deadlineInfo} />

          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1 transition-opacity shrink-0 ${
              isFocused || isSelectedForAI || showProjectPicker
                ? 'opacity-100'
                : 'opacity-85 xl:opacity-0 xl:group-hover:opacity-100 xl:focus-within:opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={onOpenAskAI}
              title="Scoped Ask AI (A)"
              className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                isSelectedForAI
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 hover:bg-blue-500/20 text-zinc-200 hover:text-blue-300 border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
              <span>Ask AI</span>
              <kbd className="text-[10px] text-zinc-500 ml-0.5">A</kbd>
            </button>

            <button
              type="button"
              onClick={() => setShowProjectPicker((prev) => !prev)}
              title="Link Arsenal Project (P)"
              className="px-2 py-1 rounded text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <Link2 className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="hidden sm:inline">Link</span>
              <kbd className="text-[10px] text-zinc-500">P</kbd>
            </button>

            <button
              type="button"
              onClick={onAdvanceStatus}
              title={`${NEXT_STATUS_LABELS[opportunity.status]} (S)`}
              className="px-2 py-1 rounded text-xs font-mono bg-zinc-900 hover:bg-emerald-500/20 text-zinc-200 hover:text-emerald-300 border border-zinc-800 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Advance</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <kbd className="text-[10px] text-zinc-500">S</kbd>
            </button>
          </div>
        </div>
      </div>

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
