'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject, RadarPriority } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { isValidHttpsUrl } from '@/lib/url';
import TrackRadarItemModal from './TrackRadarItemModal';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface RadarViewProps {
  radarItems: RadarItem[];
  projectsMap: Record<string, ArsenalProject>;
  allProjects: ArsenalProject[];
  availableDates?: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  isSignedIn?: boolean;
  onConfirmTrack: (item: RadarItem, confirmedDeadlineIso: string | null, projectId: string | null) => void;
  onToggleVerifyRadarItem: (id: string) => void;
}

const PRIORITY_GROUPS: Record<RadarPriority, { title: string; subtitle: string }> = {
  '1A': { title: 'Campus ambassador and lead roles', subtitle: 'Leadership and campus advocacy programs.' },
  '1B': { title: 'Residencies, fellowships and research', subtitle: 'Independent research grants, stipends, and builder cohorts.' },
  '1C': { title: 'Hackathons and internships', subtitle: 'Sprint builds, prize bounties, and technical sprints.' },
  '2': { title: 'Free credits and developer perks', subtitle: 'Cloud vouchers, GPU allocations, and developer perks.' },
};

export default function RadarView({
  radarItems,
  projectsMap,
  allProjects,
  availableDates = [],
  selectedDate,
  onSelectDate,
  isSignedIn = false,
  onConfirmTrack,
  onToggleVerifyRadarItem,
}: RadarViewProps) {
  const [openedUrls, setOpenedUrls] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingItem, setTrackingItem] = useState<RadarItem | null>(null);

  const currentDateStr = selectedDate || availableDates[0] || new Date().toISOString().split('T')[0];

  const handleOpenSource = (e: React.MouseEvent, item: RadarItem) => {
    e.stopPropagation();
    if (!isValidHttpsUrl(item.url)) {
      alert('Invalid URL: only HTTPS URLs are allowed');
      return;
    }
    setOpenedUrls((prev) => ({ ...prev, [item.id]: true }));
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const handlePrevDate = () => {
    if (!onSelectDate || availableDates.length <= 1) return;
    const idx = availableDates.indexOf(currentDateStr);
    if (idx > 0) onSelectDate(availableDates[idx - 1]);
  };

  const handleNextDate = () => {
    if (!onSelectDate || availableDates.length <= 1) return;
    const idx = availableDates.indexOf(currentDateStr);
    if (idx >= 0 && idx < availableDates.length - 1) onSelectDate(availableDates[idx + 1]);
  };

  const formattedDate = new Date(currentDateStr + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const priorities: RadarPriority[] = ['1A', '1B', '1C', '2'];

  return (
    <div className="pt-10 px-8 max-w-[960px] mx-auto space-y-8 text-[13px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
            Radar
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Today&apos;s digest. Open the source to verify, then track.
          </p>
        </div>

        {/* Date switcher as ghost controls */}
        <div className="flex items-center gap-1 font-mono text-[11.5px] text-ink-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevDate}
            disabled={availableDates.indexOf(currentDateStr) <= 0}
            className="p-1 text-ink-3 hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous digest"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 tabular-nums">{formattedDate}</span>
          <button
            type="button"
            onClick={handleNextDate}
            disabled={availableDates.indexOf(currentDateStr) >= availableDates.length - 1}
            className="p-1 text-ink-3 hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next digest"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isSignedIn ? (
        <div className="pt-16 text-center space-y-1">
          <p className="text-[13px] font-medium text-ink">Sign in to view radar.</p>
          <p className="text-[13px] text-ink-3">Daily digests sync to signed-in accounts via GitHub Actions.</p>
        </div>
      ) : radarItems.length === 0 ? (
        <div className="pt-16 text-center space-y-1">
          <p className="text-[13px] font-medium text-ink">No radar digest available for this date.</p>
          <p className="text-[13px] text-ink-3">Digests are generated daily at 9:00 AM IST via GitHub Actions.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {priorities.map((priority) => {
            const items = radarItems.filter((i) => i.priority === priority);
            const meta = PRIORITY_GROUPS[priority];

            return (
              <section key={priority} className="space-y-2">
                {/* Group label row with hairline */}
                <div className="flex items-baseline justify-between gap-2 pb-1 border-b border-line">
                  <div>
                    <h2 className="text-xs font-medium text-ink-3">{meta.title}</h2>
                    <p className="text-[11.5px] text-ink-3">{meta.subtitle}</p>
                  </div>
                  <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="py-3 text-xs text-ink-3">
                    No items in this section today.
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {items.map((item) => {
                      const deadlineInfo = getDeadlineInfo(item.deadline);
                      const recProject = item.recommendedProjectId ? projectsMap[item.recommendedProjectId] : null;
                      const canVerify = item.verified || openedUrls[item.id];
                      const isExpanded = expandedId === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="py-2.5 px-2 hover:bg-hover rounded-md cursor-pointer transition-colors space-y-1.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            {/* Left: Verification Dot + Title + Org */}
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canVerify) onToggleVerifyRadarItem(item.id);
                                }}
                                disabled={!canVerify}
                                className={`w-2 h-2 rounded-full shrink-0 border transition-colors ${
                                  item.verified
                                    ? 'bg-ink border-ink'
                                    : canVerify
                                    ? 'border-urgency-warn hover:bg-urgency-warn'
                                    : 'border-line-strong cursor-not-allowed opacity-50'
                                }`}
                                title={
                                  item.verified
                                    ? 'Verified (click to toggle)'
                                    : canVerify
                                    ? 'Source opened. Click to mark verified.'
                                    : 'Open source first to verify'
                                }
                              />
                              <span className="font-medium text-ink truncate text-[13px]">
                                {item.title}
                              </span>
                              <span className="text-ink-3 truncate text-xs">
                                {item.organization}
                              </span>
                              {recProject && (
                                <span className="text-[11px] font-mono text-ink-2 bg-canvas px-1.5 py-0.2 rounded border border-line shrink-0">
                                  fits: {recProject.title}
                                </span>
                              )}
                            </div>

                            {/* Right: Deadline + Source Link + Track CTA */}
                            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                              {item.deadline && (
                                <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
                                  {deadlineInfo.relativeLabel}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => handleOpenSource(e, item)}
                                className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink transition-colors"
                                title="Open source in new tab"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>

                              {item.promoted ? (
                                <span className="text-xs text-ink-3 font-mono">
                                  Tracked ✓
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTrackingItem(item);
                                  }}
                                  className="h-[26px] px-2.5 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors"
                                >
                                  Track
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Rich Briefing Summary */}
                          {item.summary && isExpanded && (
                            <div className="pt-1 text-xs text-ink-2 leading-relaxed pl-4 border-l-2 border-line">
                              {item.summary}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <TrackRadarItemModal
        isOpen={Boolean(trackingItem)}
        item={trackingItem}
        allProjects={allProjects}
        onClose={() => setTrackingItem(null)}
        onConfirmTrack={(item, confirmedDeadline, projId) => {
          onConfirmTrack(item, confirmedDeadline, projId);
          setTrackingItem(null);
        }}
      />
    </div>
  );
}
