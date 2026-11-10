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
  onPromoteRadarItem: (item: RadarItem) => void;
  onToggleVerifyRadarItem: (id: string) => void;
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
  onPromoteRadarItem,
  onToggleVerifyRadarItem,
}: RadarViewProps) {
  // Track which links user has opened, to enforce "user must open source link first"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-blue-400" />
            <h1 className="text-base font-semibold text-zinc-100">
              Daily Opportunity Radar
            </h1>
            <span className="font-mono text-xs text-zinc-500">
              · {displayDate}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Read-only daily digest. Open the source link to enable verification. Click Track to confirm deadline and copy into your Pipeline.
          </p>
        </div>

        <div className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
          LOCAL TIMEZONE
        </div>
      </div>

      <div className="space-y-6">
        {priorities.map((priority) => {
          const items = radarItems.filter((i) => i.priority === priority);
          const meta = PRIORITY_HEADINGS[priority];

          return (
            <section key={priority} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2 border-b border-zinc-800/60 pb-1.5">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-200 tracking-wide">
                    {meta.title}
                  </h2>
                  <p className="text-[11px] text-zinc-500">{meta.subtitle}</p>
                </div>
                <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                  {items.length} {items.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="p-3 rounded bg-[#0d0d10] border border-zinc-800/60 text-xs text-zinc-500 font-mono">
                  No opportunities listed in this section today.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80 border border-zinc-800/80 rounded bg-[#0d0d10]">
                  {items.map((item) => {
                    const deadlineInfo = getDeadlineInfo(item.deadline);
                    const recProject = item.recommendedProjectId ? projectsMap[item.recommendedProjectId] : null;
                    const canVerify = item.verified || openedUrls[item.id];

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#121216] transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-zinc-400">
                              {item.organization}
                            </span>
                            <span className="text-zinc-600">·</span>
                            <h3 className="text-xs font-medium text-zinc-100">
                              {item.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleOpenSource(item)}
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:underline cursor-pointer"
                              title="Open original source URL"
                            >
                              <span>Source ({item.source})</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {item.summary}
                          </p>

                          <div className="flex items-center gap-2.5 pt-1 text-[11px] font-mono text-zinc-400 flex-wrap">
                            <span>TYPE: {item.type}</span>
                            <span>·</span>
                            <span>
                              DEADLINE: {deadlineInfo.relativeLabel} ({deadlineInfo.absoluteLabel})
                            </span>
                            {recProject && (
                              <>
                                <span>·</span>
                                <span className="text-blue-300">
                                  MATCH: {recProject.title}
                                </span>
                              </>
                            )}
                            <span>·</span>
                            {/* Verified check: enabled only after user opened source */}
                            {item.verified ? (
                              <button
                                type="button"
                                onClick={() => onToggleVerifyRadarItem(item.id)}
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="Click to unverify"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>VERIFIED</span>
                              </button>
                            ) : canVerify ? (
                              <button
                                type="button"
                                onClick={() => onToggleVerifyRadarItem(item.id)}
                                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                                title="Source link opened. Click to mark verified."
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>MARK VERIFIED</span>
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-zinc-500 cursor-not-allowed"
                                title="Open the source link first to enable verification"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
                                <span>UNVERIFIED (OPEN SOURCE TO VERIFY)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.promoted ? (
                            <span className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Promoted</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onPromoteRadarItem(item)}
                              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
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
    </div>
  );
}
