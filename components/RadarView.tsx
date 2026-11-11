'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject, RadarPriority } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import TrackRadarItemModal from './TrackRadarItemModal';
import {
  Radar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

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

interface RadarViewProps {
  radarItems: RadarItem[];
  projectsMap: Record<string, ArsenalProject>;
  allProjects: ArsenalProject[];
  availableDates?: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  isLive?: boolean;
  hasSampleData?: boolean;
  onConfirmTrack: (item: RadarItem, confirmedDeadlineIso: string | null, projectId: string | null) => void;
  onToggleVerifyRadarItem: (id: string) => void;
  onLoadSampleData?: () => void;
}

const PRIORITY_HEADINGS: Record<RadarPriority, { title: string; subtitle: string }> = {
  '1A': { title: '1A · Campus Ambassador & Lead Roles', subtitle: 'Leadership and campus advocacy programs' },
  '1B': { title: '1B · Residencies, Fellowships & Research', subtitle: 'Independent research grants, stipends, and builder cohorts' },
  '1C': { title: '1C · Hackathons & Internships', subtitle: 'Sprint builds, prize bounties, and technical sprints' },
  '2': { title: '2 · Free Credits & Developer Perks', subtitle: 'Cloud vouchers, GPU allocations, and developer perks' },
};

export default function RadarView({
  radarItems,
  projectsMap,
  allProjects,
  availableDates = [],
  selectedDate,
  onSelectDate,
  isLive = false,
  hasSampleData = false,
  onConfirmTrack,
  onToggleVerifyRadarItem,
  onLoadSampleData,
}: RadarViewProps) {
  const [openedUrls, setOpenedUrls] = useState<Record<string, boolean>>({});
  const [trackingItem, setTrackingItem] = useState<RadarItem | null>(null);

  const currentDateStr = selectedDate || availableDates[0] || new Date().toISOString().split('T')[0];

  const handleOpenSource = (item: RadarItem) => {
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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const priorities: RadarPriority[] = ['1A', '1B', '1C', '2'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header & Local Timezone Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E1]">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#4355B9]" />
            <h1 className="text-xl font-semibold text-[#16181D]">
              Daily <span className="font-serif italic font-normal text-[#4355B9]">Opportunity Radar</span>
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Read-only morning digest. Open source link to unlock verification. Click Track to confirm deadline & copy into pipeline.
          </p>
        </div>

        {/* Date Switcher */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E5E1] rounded-lg p-1 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevDate}
            disabled={availableDates.indexOf(currentDateStr) <= 0}
            title="Previous digest"
            className="p-1 rounded text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2 font-mono text-xs text-[#16181D]">
            <Calendar className="w-3.5 h-3.5 text-[#4355B9]" />
            <span>{formattedDate}</span>
          </div>

          <button
            type="button"
            onClick={handleNextDate}
            disabled={availableDates.indexOf(currentDateStr) >= availableDates.length - 1}
            title="Next digest"
            className="p-1 rounded text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {radarItems.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-[#E5E5E1] bg-white space-y-3 shadow-2xs">
          <p className="text-xs text-[#6B7280]">
            No digest yet. The morning job fills this after setup.
          </p>
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
      ) : (
        <div className="space-y-6">
          {priorities.map((priority) => {
            const items = radarItems.filter((i) => i.priority === priority);
            const meta = PRIORITY_HEADINGS[priority];

            return (
              <section key={priority} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2 border-b border-[#E5E5E1] pb-1.5">
                  <div>
                    <h2 className="text-xs font-semibold text-[#16181D] tracking-wide">
                      {meta.title}
                    </h2>
                    <p className="text-[11px] text-[#6B7280]">{meta.subtitle}</p>
                  </div>
                  <span className="font-mono text-[11px] text-[#6B7280] tabular-nums">
                    {items.length} {items.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="p-3 rounded-lg bg-white border border-[#E5E5E1] text-xs text-[#6B7280] font-mono shadow-2xs">
                    No opportunities listed in this section today.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5E1] border border-[#E5E5E1] rounded-lg bg-white shadow-2xs">
                    {items.map((item) => {
                      const deadlineInfo = getDeadlineInfo(item.deadline);
                      const recProject = item.recommendedProjectId ? projectsMap[item.recommendedProjectId] : null;
                      const fitsLabel = recProject ? recProject.title : 'Fresh';
                      const canVerify = item.verified || openedUrls[item.id];

                      return (
                        <div
                          key={item.id}
                          className="px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-[#FAFAFA] transition-colors"
                        >
                          {/* Name & Org */}
                          <div className="min-w-0 flex-1 flex items-baseline gap-2">
                            <span className="font-mono text-[11px] text-[#6B7280] shrink-0">
                              {item.organization}
                            </span>
                            <span className="text-[#E5E5E1]" aria-hidden="true">·</span>
                            <span className="font-medium text-[#16181D] truncate" title={item.title}>
                              {item.title}
                            </span>
                          </div>

                          {/* Deadline, Fits, Source link, Verify, Track */}
                          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 justify-between md:justify-end flex-wrap">
                            {/* Deadline */}
                            <span className="text-[#6B7280] whitespace-nowrap" title={item.deadline || undefined}>
                              {deadlineInfo.relativeLabel}
                            </span>

                            <span className="text-[#E5E5E1]" aria-hidden="true">·</span>

                            {/* Fits */}
                            <span
                              className={`whitespace-nowrap ${
                                recProject ? 'text-[#4355B9] font-medium' : 'text-[#6B7280]'
                              }`}
                              title={recProject ? `Fits: ${recProject.title}` : 'No project linked yet'}
                            >
                              {fitsLabel}
                            </span>

                            <span className="text-[#E5E5E1]" aria-hidden="true">·</span>

                            {/* Source Link */}
                            <button
                              type="button"
                              onClick={() => handleOpenSource(item)}
                              className="inline-flex items-center gap-1 text-[#4355B9] hover:underline whitespace-nowrap"
                              title="Open source link in new tab"
                            >
                              <span>Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            <span className="text-[#E5E5E1]" aria-hidden="true">·</span>

                            {/* Verify Button */}
                            {item.verified ? (
                              <button
                                type="button"
                                onClick={() => onToggleVerifyRadarItem(item.id)}
                                className="inline-flex items-center gap-1 text-[#067647] bg-[#ECFDF3] border border-[#D1FADF] px-1.5 py-0.5 rounded text-[10px]"
                                title="Click to unverify"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </button>
                            ) : canVerify ? (
                              <button
                                type="button"
                                onClick={() => onToggleVerifyRadarItem(item.id)}
                                className="inline-flex items-center gap-1 text-[#B54708] bg-[#FEF0C7] border border-[#FEDF89] px-1.5 py-0.5 rounded hover:bg-[#FEE4E2] transition-colors text-[10px]"
                                title="Source link opened. Click to mark verified."
                              >
                                <AlertCircle className="w-3 h-3" />
                                <span>Mark verified</span>
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[#6B7280] bg-[#F5F5F3] border border-[#E5E5E1] px-1.5 py-0.5 rounded text-[10px] cursor-not-allowed opacity-75"
                                title="Open the source link first to enable verification"
                              >
                                <span>Unverified</span>
                              </span>
                            )}

                            {/* Track Button */}
                            {item.promoted ? (
                              <span className="px-2.5 py-1 rounded bg-[#ECFDF3] border border-[#D1FADF] text-[#067647] flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Promoted</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setTrackingItem(item)}
                                className="px-2.5 py-1 rounded bg-[#4355B9] hover:bg-[#3848A3] text-white flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs text-[11px] font-medium"
                              >
                                <span>Track</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
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

      {/* Confirmation Modal to Confirm Deadline and Track into Pipeline */}
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
