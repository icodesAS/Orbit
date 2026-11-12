'use client';

import React from 'react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';

interface TodayViewProps {
  opportunities: Opportunity[];
  projectsMap: Record<string, ArsenalProject>;
  focusedId: string | null;
  unreviewedRadarCount: number;
  canUseAi?: boolean;
  onFocusOpportunity: (id: string) => void;
  onOpenAskAI: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onJumpToRadar: () => void;
  onOpenNewModal?: () => void;
}

export default function TodayView({
  opportunities,
  unreviewedRadarCount,
  onFocusOpportunity,
  onJumpToRadar,
  onOpenNewModal,
}: TodayViewProps) {
  const urgentItems = opportunities
    .filter((o) => (o.status === 'active' || o.status === 'waitlist') && o.deadline)
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

  const within24h = urgentItems.filter((i) => (i.deadlineInfo.hoursRemaining ?? 999) <= 24);
  const within72h = urgentItems.filter((i) => (i.deadlineInfo.hoursRemaining ?? 999) > 24);

  return (
    <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
            Today
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Deadlines in the next 72 hours.
          </p>
        </div>

        {urgentItems.length > 0 && onOpenNewModal && (
          <button
            type="button"
            onClick={onOpenNewModal}
            className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors"
          >
            Add opportunity <span className="font-mono text-ink-3 ml-1">N</span>
          </button>
        )}
      </div>

      {/* Radar Strip - 40px single line, hidden if 0 */}
      {unreviewedRadarCount > 0 && (
        <div className="h-10 flex items-center justify-between border-b border-line text-[13px]">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-medium text-ink">Radar</span>
            <span className="text-ink-2 truncate">
              {unreviewedRadarCount} new in today&apos;s digest
            </span>
          </div>
          <button
            type="button"
            onClick={onJumpToRadar}
            className="text-ink-2 hover:text-ink text-xs font-medium transition-colors shrink-0 ml-3"
          >
            Review →
          </button>
        </div>
      )}

      {/* Empty States - Plain text on canvas, no boxes */}
      {opportunities.length === 0 ? (
        <div className="pt-16 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-ink">
              Workspace is empty.
            </p>
            <p className="text-[13px] text-ink-3">
              Add your first opportunity track or check the radar digest.
            </p>
          </div>
          {onOpenNewModal && (
            <button
              type="button"
              onClick={onOpenNewModal}
              className="h-[30px] px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-text text-xs font-medium transition-colors"
            >
              Add opportunity <span className="font-mono opacity-60 ml-1">N</span>
            </button>
          )}
        </div>
      ) : urgentItems.length === 0 ? (
        <div className="pt-16 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-ink">
              Nothing due in the next 72 hours.
            </p>
            <p className="text-[13px] text-ink-3">
              Add an opportunity or review your pipeline.
            </p>
          </div>
          {onOpenNewModal && (
            <button
              type="button"
              onClick={onOpenNewModal}
              className="h-[30px] px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-text text-xs font-medium transition-colors"
            >
              Add opportunity <span className="font-mono opacity-60 ml-1">N</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Next 24 hours */}
          {within24h.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-3 pb-1 border-b border-line">
                <span className="font-medium">Next 24 hours</span>
                <span className="font-mono tabular-nums">{within24h.length}</span>
              </div>
              <div className="divide-y divide-line">
                {within24h.map(({ opp, deadlineInfo }) => (
                  <div
                    key={opp.id}
                    onClick={() => onFocusOpportunity(opp.id)}
                    className="h-10 px-2 flex items-center justify-between text-[13px] hover:bg-hover rounded-md cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-urgency-hot shrink-0" />
                      <span className="font-medium text-ink truncate">{opp.title}</span>
                      <span className="text-ink-3 truncate text-xs">{opp.organization}</span>
                    </div>
                    <span className="font-mono text-[11.5px] text-urgency-hot tabular-nums shrink-0 ml-3">
                      {deadlineInfo.relativeLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next 3 days */}
          {within72h.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-3 pb-1 border-b border-line">
                <span className="font-medium">Next 3 days</span>
                <span className="font-mono tabular-nums">{within72h.length}</span>
              </div>
              <div className="divide-y divide-line">
                {within72h.map(({ opp, deadlineInfo }) => (
                  <div
                    key={opp.id}
                    onClick={() => onFocusOpportunity(opp.id)}
                    className="h-10 px-2 flex items-center justify-between text-[13px] hover:bg-hover rounded-md cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-urgency-warn shrink-0" />
                      <span className="font-medium text-ink truncate">{opp.title}</span>
                      <span className="text-ink-3 truncate text-xs">{opp.organization}</span>
                    </div>
                    <span className="font-mono text-[11.5px] text-urgency-warn tabular-nums shrink-0 ml-3">
                      {deadlineInfo.relativeLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
