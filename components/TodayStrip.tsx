'use client';

import React from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import {
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Radar,
  CheckCircle2,
} from 'lucide-react';

interface TodayStripProps {
  opportunities: Opportunity[];
  projectsMap: Record<string, ArsenalProject>;
  focusedId: string | null;
  unreviewedRadarCount: number;
  isLive?: boolean;
  hasSampleData?: boolean;
  onFocusOpportunity: (id: string) => void;
  onOpenAskAI: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onJumpToRadar: () => void;
  onOpenNewModal?: () => void;
  onLoadSampleData?: () => void;
}

export default function TodayStrip({
  opportunities,
  projectsMap,
  focusedId,
  unreviewedRadarCount,
  isLive = false,
  hasSampleData = false,
  onFocusOpportunity,
  onOpenAskAI,
  onAdvanceStatus,
  onJumpToRadar,
  onOpenNewModal,
  onLoadSampleData,
}: TodayStripProps) {
  // Items in Active or Waitlist due within the next 72 hours
  const urgentItems = opportunities
    .filter((o) => o.status === 'active' || o.status === 'waitlist')
    .map((o) => ({
      opp: o,
      deadlineInfo: getDeadlineInfo(o.deadline, o.status),
    }))
    .filter((item) => item.deadlineInfo.isUrgent72h)
    .sort(
      (a, b) =>
        (a.deadlineInfo.hoursRemaining ?? 999) -
        (b.deadlineInfo.hoursRemaining ?? 999)
    );

  return (
    <section
      aria-label="Pinned Today Horizon"
      className="bg-[#0e0e11] border-b border-zinc-800/80 px-5 py-3 shrink-0"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="font-semibold text-zinc-100 tracking-tight flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Today Horizon (72h)
          </span>
          <span className="text-zinc-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
            {urgentItems.length} urgent{' '}
            {urgentItems.length === 1 ? 'deadline' : 'deadlines'}
          </span>
        </div>

        <button
          type="button"
          onClick={onJumpToRadar}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-100 transition-colors self-start lg:self-auto group whitespace-nowrap shrink-0"
        >
          <Radar className="w-3.5 h-3.5 text-blue-400" />
          <span>Daily Radar</span>
          <span className="text-zinc-600" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px] text-blue-400 tabular-nums group-hover:underline">
            {unreviewedRadarCount} unpromoted matches →
          </span>
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 gap-2">
          <span>No opportunities in your workspace yet.</span>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenNewModal && (
              <button
                type="button"
                onClick={onOpenNewModal}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] transition-colors"
              >
                Add your first opportunity
              </button>
            )}
            {!isLive && !hasSampleData && onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] transition-colors"
              >
                Load sample data
              </button>
            )}
          </div>
        </div>
      ) : urgentItems.length === 0 ? (
        <div className="flex items-center justify-between py-2 px-3 rounded bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero hard deadlines expiring within the next 72 hours.</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
            72H CLEAR
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {urgentItems.map(({ opp, deadlineInfo }) => {
            const isRed = deadlineInfo.heat === 'red';
            const isFocused = focusedId === opp.id;
            const linkedNames = opp.projectIds
              .map((pid) => projectsMap[pid]?.title)
              .filter(Boolean);

            return (
              <div
                key={opp.id}
                onClick={() => onFocusOpportunity(opp.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onFocusOpportunity(opp.id);
                  }
                }}
                className={`group relative rounded px-3 py-2.5 border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                  isFocused
                    ? 'bg-zinc-900/95 border-blue-500/50'
                    : 'bg-[#121216] hover:bg-zinc-900/80 border-zinc-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 tabular-nums">
                      <span>{opp.code}</span>
                      <span aria-hidden="true" className="text-zinc-600">
                        ·
                      </span>
                      <span className="text-zinc-400 truncate">
                        {opp.organization}
                      </span>
                    </div>
                    <h4 className="text-xs font-medium text-zinc-100 truncate mt-0.5">
                      {opp.title}
                    </h4>
                  </div>

                  <div
                    className={`font-mono text-[11px] tabular-nums whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      isRed
                        ? 'text-rose-400 font-semibold'
                        : 'text-amber-400 font-medium'
                    }`}
                    title={`Due ${deadlineInfo.absoluteLabel}`}
                  >
                    {isRed && <Flame className="w-3 h-3 shrink-0" />}
                    <span>{deadlineInfo.relativeLabel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 min-w-0 text-[11px] font-mono text-zinc-400 tabular-nums">
                    <span>
                      {opp.tasksDone}/{opp.tasksTotal} tasks
                    </span>
                    {linkedNames.length > 0 && (
                      <>
                        <span aria-hidden="true" className="text-zinc-700">
                          /
                        </span>
                        <span className="text-zinc-300 truncate">
                          {linkedNames.join(', ')}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenAskAI(opp)}
                      title="Open Scoped Ask AI (A)"
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 hover:text-blue-300 hover:bg-blue-500/15 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                      <span>AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdvanceStatus(opp.id)}
                      title="Advance Status (S)"
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 hover:text-emerald-300 hover:bg-emerald-500/15 transition-colors whitespace-nowrap shrink-0 flex items-center gap-0.5"
                    >
                      <span>Submit</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
