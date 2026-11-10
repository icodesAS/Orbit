'use client';

import React from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import OpportunityHeatChip from './OpportunityHeatChip';
import {
  Clock,
  Radar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface TodayViewProps {
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

export default function TodayView({
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
}: TodayViewProps) {
  // Urgent items within 72h horizon
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Heading with Italic Serif Accent */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#E5E5E1]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#16181D]">
            Today <span className="font-serif italic font-normal text-[#4355B9]">Horizon</span>
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Hard deadlines expiring within 72 hours, prioritized for execution.
          </p>
        </div>

        {/* Morning Digest Link */}
        <button
          type="button"
          onClick={onJumpToRadar}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5E1] bg-white hover:bg-[#F5F5F3] text-xs text-[#16181D] transition-colors self-start sm:self-auto group shadow-2xs"
        >
          <Radar className="w-3.5 h-3.5 text-[#4355B9]" />
          <span>Daily Radar</span>
          <span className="text-[#E5E5E1]" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-[#4355B9] font-medium group-hover:underline">
            {unreviewedRadarCount} new in this morning&apos;s digest →
          </span>
        </button>
      </div>

      {/* Horizon Content */}
      {opportunities.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-[#E5E5E1] bg-white space-y-3">
          <p className="text-xs text-[#6B7280]">
            No opportunities in your workspace yet.
          </p>
          <div className="flex items-center justify-center gap-2">
            {onOpenNewModal && (
              <button
                type="button"
                onClick={onOpenNewModal}
                className="px-3 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add your first opportunity</span>
              </button>
            )}
            {!isLive && !hasSampleData && onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs transition-colors shadow-2xs"
              >
                Load sample data
              </button>
            )}
          </div>
        </div>
      ) : urgentItems.length === 0 ? (
        <div className="p-6 rounded-lg border border-[#E5E5E1] bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#16181D]">
            <CheckCircle2 className="w-4 h-4 text-[#067647]" />
            <span>Zero hard deadlines expiring within the next 72 hours.</span>
          </div>
          <span className="font-mono text-[11px] text-[#6B7280] font-medium">
            72H CLEAR
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B7280] px-1 font-mono">
            <span>DUE SOON ({urgentItems.length})</span>
            <span>PRESS ENTER TO EXPAND</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentItems.map(({ opp, deadlineInfo }) => {
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
                  className={`rounded-lg p-4 border transition-all text-left flex flex-col justify-between gap-3 bg-white cursor-pointer ${
                    isFocused
                      ? 'border-[#4355B9] ring-1 ring-[#4355B9]/20 shadow-xs'
                      : 'border-[#E5E5E1] hover:border-[#D1D1CB] shadow-2xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280]">
                        <span className="font-semibold text-[#16181D]">{opp.code}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{opp.organization}</span>
                      </div>
                      <OpportunityHeatChip deadlineInfo={deadlineInfo} />
                    </div>

                    <h3 className="text-sm font-semibold text-[#16181D] leading-snug">
                      {opp.title}
                    </h3>

                    {opp.notes && (
                      <p className="text-xs text-[#6B7280] line-clamp-2">
                        {opp.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E5E1] text-[11px] font-mono text-[#6B7280]">
                    <div className="flex items-center gap-2 truncate">
                      <span>
                        {opp.tasksDone}/{opp.tasksTotal} tasks
                      </span>
                      {linkedNames.length > 0 && (
                        <>
                          <span aria-hidden="true" className="text-[#E5E5E1]">/</span>
                          <span className="text-[#16181D] truncate font-medium">
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
                        title="Scoped Ask AI (A)"
                        className="px-2 py-0.5 rounded text-[11px] font-mono text-[#4355B9] hover:bg-[#4355B9]/10 transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdvanceStatus(opp.id)}
                        title="Advance Status (S)"
                        className="px-2 py-0.5 rounded text-[11px] font-mono text-[#067647] hover:bg-[#067647]/10 transition-colors flex items-center gap-0.5"
                      >
                        <span>Submit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
