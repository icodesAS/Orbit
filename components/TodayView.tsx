'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Pencil, CheckCircle2, ExternalLink } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { isValidHttpsUrl } from '@/lib/url';
import { OrbitGlyph } from './OrbitGlyph';
import { fadeUp, stagger } from '@/lib/motion';

interface TodayViewProps {
  opportunities: Opportunity[];
  unreviewedRadarCount: number;
  isSyncing?: boolean;
  onFocusOpportunity: (id: string) => void;
  onOpenEdit?: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onJumpToRadar: () => void;
  onJumpToPipeline?: () => void;
  onOpenNewModal?: () => void;
}

export default function TodayView({
  opportunities,
  unreviewedRadarCount,
  isSyncing = false,
  onFocusOpportunity,
  onOpenEdit,
  onAdvanceStatus,
  onJumpToRadar,
  onJumpToPipeline,
  onOpenNewModal,
}: TodayViewProps) {
  const visibleOpportunities = opportunities.filter((o) => o.status !== 'archived');
  const allWithDeadlines = visibleOpportunities
    .filter((o) => (o.status === 'active' || o.status === 'waitlist') && o.deadline)
    .map((o) => ({
      opp: o,
      deadlineInfo: getDeadlineInfo(o.deadline, o.status),
    }))
    .filter((item) => (item.deadlineInfo.hoursRemaining ?? -999) > -24)
    .sort(
      (a, b) =>
        (a.deadlineInfo.hoursRemaining ?? 999) -
        (b.deadlineInfo.hoursRemaining ?? 999)
    );

  const urgentItems = allWithDeadlines.filter((item) => item.deadlineInfo.isUrgent72h);
  const nextUpcoming = allWithDeadlines.find((item) => !item.deadlineInfo.isUrgent72h) || null;

  const within24h = urgentItems.filter((i) => (i.deadlineInfo.hoursRemaining ?? 999) <= 24);
  const within72h = urgentItems.filter((i) => (i.deadlineInfo.hoursRemaining ?? 999) > 24);

  const subtitle =
    urgentItems.length > 0
      ? `${urgentItems.length} deadline${urgentItems.length === 1 ? '' : 's'} in the next 72 hours`
      : 'Nothing due in the next 72 hours';

  const getCountdownColor = (hrs: number | null) => {
    if (hrs === null) return 'text-ink-3';
    if (hrs <= 6) return 'text-bad font-medium';
    if (hrs <= 24) return 'text-warn font-medium';
    if (hrs <= 48) return 'text-ink-2';
    return 'text-ink-3';
  };

  return (
    <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-line">
        <div>
          <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.022em] text-ink">
            Today
          </h1>
          <p className="text-[13.5px] text-ink-2 mt-1">{subtitle}</p>
        </div>

        {urgentItems.length > 0 && onOpenNewModal && (
          <button type="button" onClick={onOpenNewModal} className="btn btn-secondary">
            <span>New track</span>
            <span className="kbd">N</span>
          </button>
        )}
      </div>

      {/* Radar Digest Strip */}
      {unreviewedRadarCount > 0 && (
        <div className="h-10 px-3 rounded-[8px] bg-raised border border-line flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="dot dot-ok" />
            <span className="font-medium text-ink">Radar</span>
            <span className="text-ink-2 truncate">
              {unreviewedRadarCount} new in today&apos;s digest
            </span>
          </div>
          <button
            type="button"
            onClick={onJumpToRadar}
            className="btn btn-ghost btn-sm shrink-0"
          >
            Review →
          </button>
        </div>
      )}

      {/* Empty State Variant 1: Empty Workspace */}
      {isSyncing && visibleOpportunities.length === 0 ? (
        <div className="space-y-2 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[52px] rounded-[8px] bg-raised border border-line animate-pulse" />
          ))}
        </div>
      ) : visibleOpportunities.length === 0 ? (
        <motion.div
          variants={stagger(0.06, 0.04)}
          initial="hidden"
          animate="show"
          className="min-h-[360px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3"
        >
          <motion.div variants={fadeUp}>
            <OrbitGlyph size="lg" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-[15px] font-semibold text-ink tracking-[-0.01em] mt-1"
          >
            Start your pipeline
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed"
          >
            Track hackathons, internships and challenges here. Deadlines inside 72 hours show up on this page.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 pt-2">
            {onOpenNewModal && (
              <button type="button" onClick={onOpenNewModal} className="btn btn-primary">
                <span>New track</span>
                <span className="kbd">N</span>
              </button>
            )}
            <button type="button" onClick={onJumpToRadar} className="btn btn-secondary">
              Open Radar
            </button>
          </motion.div>
        </motion.div>
      ) : urgentItems.length === 0 ? (
        /* Empty State Variant 2: Tracks exist, nothing due in 72h */
        <motion.div
          variants={stagger(0.06, 0.04)}
          initial="hidden"
          animate="show"
          className="min-h-[360px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3"
        >
          <motion.div variants={fadeUp}>
            <OrbitGlyph size="lg" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-[15px] font-semibold text-ink tracking-[-0.01em] mt-1"
          >
            Nothing due in 72 hours
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed"
          >
            {nextUpcoming
              ? `Next deadline: ${nextUpcoming.opp.title} (${nextUpcoming.deadlineInfo.relativeLabel}).`
              : 'Your active pipeline tracks have no deadlines inside the next 72 hours.'}
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 pt-2">
            {onJumpToPipeline && (
              <button type="button" onClick={onJumpToPipeline} className="btn btn-secondary">
                Open Pipeline
              </button>
            )}
            {onOpenNewModal && (
              <button type="button" onClick={onOpenNewModal} className="btn btn-ghost">
                <span>New track</span>
                <span className="kbd">N</span>
              </button>
            )}
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {[
            { label: 'TODAY / NEXT 24 HOURS', items: within24h, isHot: true },
            { label: 'IN THE NEXT 72 HOURS', items: within72h, isHot: false },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.label} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 pb-1.5 border-b border-line">
                  <span>{group.label}</span>
                  <span className="tabular-nums">{group.items.length}</span>
                </div>
                <div className="divide-y divide-line-faint">
                  {group.items.map(({ opp, deadlineInfo }) => {
                    const hrs = deadlineInfo.hoursRemaining;
                    return (
                      <div
                        key={opp.id}
                        onClick={() => {
                          onFocusOpportunity(opp.id);
                          if (onOpenEdit) onOpenEdit(opp);
                        }}
                        className="group relative h-[52px] px-2.5 flex items-center justify-between gap-3 hover:bg-hover rounded-[8px] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`dot ${
                              hrs !== null && hrs <= 6
                                ? 'dot-bad'
                                : group.isHot
                                ? 'dot-warn'
                                : ''
                            } shrink-0`}
                          />
                          <span className="text-[14px] font-medium text-ink truncate">
                            {opp.title}
                          </span>
                          <span className="text-[13px] text-ink-3 truncate">
                            {opp.organization}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="chip">{opp.type}</span>
                          <span
                            className={`font-mono text-[12px] tabular-nums ${getCountdownColor(
                              hrs
                            )}`}
                          >
                            {deadlineInfo.relativeLabel}
                          </span>

                          {/* Hover actions */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="hidden group-hover:flex items-center gap-1 pl-2 bg-hover"
                          >
                            {opp.url && isValidHttpsUrl(opp.url) && (
                              <a
                                href={opp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open link"
                                title="Open link"
                                className="btn btn-ghost btn-icon"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {onOpenEdit && (
                              <button
                                type="button"
                                aria-label="Edit track (E)"
                                title="Edit track (E)"
                                onClick={() => onOpenEdit(opp)}
                                className="btn btn-ghost btn-icon"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label="Advance status (S)"
                              title="Advance status (S)"
                              onClick={() => onAdvanceStatus(opp.id)}
                              className="btn btn-ghost btn-icon"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
