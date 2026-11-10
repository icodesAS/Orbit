'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject, RadarPriority } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import {
  Radar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface RadarViewProps {
  radarItems: RadarItem[];
  projectsMap: Record<string, ArsenalProject>;
  currentDate?: string;
  isLive?: boolean;
  hasSampleData?: boolean;
  onPromoteRadarItem: (item: RadarItem) => void;
  onToggleVerifyRadarItem: (id: string) => void;
  onLoadSampleData?: () => void;
}

const PRIORITY_HEADINGS: Record<RadarPriority, { title: string; subtitle: string }> = {
  '1A': {
    title: '1A · Campus Ambassador & Lead Roles',
    subtitle: 'High-leverage leadership and campus advocacy programs',
  },
  '1B': {
    title: '1B · Residencies, Fellowships & Research',
    subtitle: 'Independent research grants, stipends, and builder cohorts',
  },
  '1C': {
    title: '1C · Hackathons & Internships',
    subtitle: 'Competitive sprint builds, prize bounties, and technical sprints',
  },
  '2': {
    title: '2 · Free Credits & Developer Perks',
    subtitle: 'Cloud vouchers, GPU allocations, and developer tier perks',
  },
};

export default function RadarView({
  radarItems,
  projectsMap,
  currentDate,
  isLive = false,
  hasSampleData = false,
  onPromoteRadarItem,
  onToggleVerifyRadarItem,
  onLoadSampleData,
}: RadarViewProps) {
  const [openedUrls, setOpenedUrls] = useState<Record<string, boolean>>({});

  const displayDate = currentDate || new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleOpenSource = (item: RadarItem) => {
    setOpenedUrls((prev) => ({ ...prev, [item.id]: true }));
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const priorities: RadarPriority[] = ['1A', '1B', '1C', '2'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E1]">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#4355B9]" />
            <h1 className="text-xl font-semibold text-[#16181D]">
              Daily <span className="font-serif italic font-normal text-[#4355B9]">Opportunity Radar</span>
            </h1>
            <span className="font-mono text-xs text-[#6B7280]">
              · {displayDate}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Read-only daily digest. Open the source link to enable verification. Click Track to confirm deadline and copy into your Pipeline.
          </p>
        </div>

        <div className="font-mono text-[11px] text-[#6B7280] tabular-nums shrink-0">
          LOCAL TIMEZONE
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
                      const canVerify = item.verified || openedUrls[item.id];

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#FAFAFA] transition-colors"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-[#6B7280]">
                                {item.organization}
                              </span>
                              <span className="text-[#E5E5E1]">·</span>
                              <h3 className="text-xs font-semibold text-[#16181D]">
                                {item.title}
                              </h3>
                              <button
                                type="button"
                                onClick={() => handleOpenSource(item)}
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#4355B9] hover:underline cursor-pointer"
                                title="Open original source URL"
                              >
                                <span>Source ({item.source})</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-xs text-[#16181D] leading-relaxed">
                              {item.summary}
                            </p>

                            <div className="flex items-center gap-2.5 pt-1 text-[11px] font-mono text-[#6B7280] flex-wrap">
                              <span>TYPE: {item.type}</span>
                              <span className="text-[#E5E5E1]">·</span>
                              <span>
                                DEADLINE: {deadlineInfo.relativeLabel} ({deadlineInfo.absoluteLabel})
                              </span>
                              {recProject && (
                                <>
                                  <span className="text-[#E5E5E1]">·</span>
                                  <span className="text-[#4355B9] font-medium">
                                    MATCH: {recProject.title}
                                  </span>
                                </>
                              )}
                              <span className="text-[#E5E5E1]">·</span>
                              {item.verified ? (
                                <button
                                  type="button"
                                  onClick={() => onToggleVerifyRadarItem(item.id)}
                                  className="inline-flex items-center gap-1 text-[#067647] hover:opacity-80 transition-opacity bg-[#ECFDF3] border border-[#D1FADF] px-1.5 py-0.2 rounded"
                                  title="Click to unverify"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>VERIFIED</span>
                                </button>
                              ) : canVerify ? (
                                <button
                                  type="button"
                                  onClick={() => onToggleVerifyRadarItem(item.id)}
                                  className="inline-flex items-center gap-1 text-[#B54708] hover:opacity-80 transition-opacity bg-[#FEF0C7] border border-[#FEDF89] px-1.5 py-0.2 rounded"
                                  title="Source link opened. Click to mark verified."
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>MARK VERIFIED</span>
                                </button>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-[#6B7280] cursor-not-allowed text-[10px]"
                                  title="Open the source link first to enable verification"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5 text-[#6B7280]" />
                                  <span>UNVERIFIED (OPEN SOURCE TO VERIFY)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.promoted ? (
                              <span className="px-3 py-1 rounded-lg bg-[#ECFDF3] border border-[#D1FADF] font-mono text-xs text-[#067647] flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Promoted</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onPromoteRadarItem(item)}
                                className="px-3 py-1 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white font-mono text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                              >
                                <span>Track</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
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
    </div>
  );
}
