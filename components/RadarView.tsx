'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ExternalLink, Check } from 'lucide-react';
import { RadarItem, ArsenalProject, RadarPriority } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { isValidHttpsUrl } from '@/lib/url';
import TrackRadarItemModal from './TrackRadarItemModal';
import { OrbitGlyph } from './OrbitGlyph';
import { fadeUp, spring, stagger, useSpring } from '@/lib/motion';

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

const PRIORITY_GROUPS: Record<RadarPriority, string> = {
  '1A': '1A · Campus ambassador & lead roles',
  '1B': '1B · Residencies, fellowships & research',
  '1C': '1C · Hackathons & internships',
  '2': '2 · Free credits & developer perks',
};

function getSourceDomain(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return fallback; }
}

export default function RadarView({
  radarItems, projectsMap, allProjects, availableDates = [],
  selectedDate, onSelectDate, isSignedIn = false,
  onConfirmTrack, onToggleVerifyRadarItem,
}: RadarViewProps) {
  const [openedUrls, setOpenedUrls] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingItem, setTrackingItem] = useState<RadarItem | null>(null);
  const accordionSpring = useSpring('smooth');

  const currentDateStr = selectedDate || availableDates[0] || new Date().toISOString().split('T')[0];

  const handleOpenSource = (e: React.MouseEvent, item: RadarItem) => {
    e.stopPropagation();
    if (!isValidHttpsUrl(item.url)) return;
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

  const formattedDate = new Date(currentDateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const priorities: RadarPriority[] = ['1A', '1B', '1C', '2'];

  return (
    <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-8 text-[13.5px]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-line">
        <div>
          <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.022em] text-ink">Radar</h1>
          <p className="text-[13.5px] text-ink-2 mt-1">Today&apos;s digest · {formattedDate}</p>
        </div>

        <div className="flex items-center gap-1 font-mono text-[12px] text-ink-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevDate}
            disabled={availableDates.indexOf(currentDateStr) <= 0}
            className="btn btn-ghost btn-icon"
            title="Previous digest"
            aria-label="Previous digest"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 tabular-nums">{formattedDate}</span>
          <button
            type="button"
            onClick={handleNextDate}
            disabled={availableDates.indexOf(currentDateStr) >= availableDates.length - 1}
            className="btn btn-ghost btn-icon"
            title="Next digest"
            aria-label="Next digest"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isSignedIn ? (
        <motion.div variants={stagger(0.06, 0.04)} initial="hidden" animate="show" className="min-h-[340px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
          <motion.div variants={fadeUp}><OrbitGlyph size="lg" /></motion.div>
          <motion.h2 variants={fadeUp} className="text-[15px] font-semibold text-ink mt-1">Sign in to view Radar</motion.h2>
          <motion.p variants={fadeUp} className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed">
            Daily morning digests run in your repository via GitHub Actions and sync to your account.
          </motion.p>
        </motion.div>
      ) : radarItems.length === 0 ? (
        <motion.div variants={stagger(0.06, 0.04)} initial="hidden" animate="show" className="min-h-[340px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
          <motion.div variants={fadeUp}><OrbitGlyph size="lg" /></motion.div>
          <motion.h2 variants={fadeUp} className="text-[15px] font-semibold text-ink mt-1">No new items in today&apos;s digest</motion.h2>
          <motion.p variants={fadeUp} className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed">
            Digests run on schedule via GitHub Actions and appear here when new opportunities match your priorities.
          </motion.p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {priorities.map((priority) => {
            const items = radarItems.filter((i) => i.priority === priority);
            return (
              <section key={priority} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-line">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">{PRIORITY_GROUPS[priority]}</h2>
                  <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">{items.length}</span>
                </div>

                {items.length === 0 ? (
                  <div className="h-10 flex items-center text-[13px] text-ink-3">No items in this priority today</div>
                ) : (
                  <div className="divide-y divide-line-faint">
                    {items.map((item) => {
                      const deadlineInfo = getDeadlineInfo(item.deadline);
                      const recProject = item.recommendedProjectId ? projectsMap[item.recommendedProjectId] : null;
                      const canVerify = item.verified || openedUrls[item.id];
                      const isExpanded = expandedId === item.id;
                      const domain = getSourceDomain(item.url, item.organization);

                      return (
                        <div key={item.id}>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : item.id); } }}
                            className={`min-h-[56px] px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-hover rounded-[8px] cursor-pointer transition-colors ${item.promoted ? 'text-ink-3' : ''}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`dot shrink-0 ${item.verified ? 'dot-ok' : openedUrls[item.id] ? 'dot-warn' : ''}`}
                                title={item.verified ? 'Verified against source' : openedUrls[item.id] ? 'Source opened, ready to verify' : 'Unverified — open source first'}
                              />
                              <span className={`text-[14px] font-medium truncate ${item.promoted ? 'text-ink-3' : 'text-ink'}`}>{item.title}</span>
                              <span className="font-mono text-[12px] text-ink-3 truncate">{item.organization} · {domain}</span>
                              {recProject && <span className="chip hidden sm:inline-flex">fits: {recProject.title}</span>}
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {item.deadline && <span className="font-mono text-[12px] text-ink-3 tabular-nums">{deadlineInfo.relativeLabel}</span>}
                              {item.promoted && (
                                <span className="chip chip-ok">
                                  <Check className="w-3 h-3" />
                                  <span>Tracked</span>
                                </span>
                              )}
                              <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={spring.snappy} className="text-ink-3 flex items-center justify-center">
                                <ChevronRight className="w-4 h-4" />
                              </motion.span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                role="region"
                                aria-label={`Briefing for ${item.title}`}
                                style={{ overflow: 'hidden' }}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1, transition: { height: accordionSpring, opacity: { duration: 0.16, delay: 0.04 } } }}
                                exit={{ height: 0, opacity: 0, transition: { height: accordionSpring, opacity: { duration: 0.12 } } }}
                              >
                                <div className="px-5 py-4 bg-raised border-y border-line space-y-3">
                                  <p className="text-[14px] leading-[1.6] text-ink-2 max-w-[62ch]">
                                    {item.summary || 'Open the source link below to inspect full eligibility, timeline, and submission details.'}
                                  </p>

                                  <div className="flex items-center gap-2 font-mono text-[12px] text-ink-3">
                                    <span className={`dot ${item.verified ? 'dot-ok' : openedUrls[item.id] ? 'dot-warn' : ''}`} />
                                    <span>{domain} · {item.verified ? 'verified' : openedUrls[item.id] ? 'source opened' : 'unverified'}</span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {!item.promoted && (
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setTrackingItem(item); }} className="btn btn-primary btn-sm">
                                        Track
                                      </button>
                                    )}
                                    <button type="button" onClick={(e) => handleOpenSource(e, item)} className="btn btn-ghost btn-sm">
                                      <span>Open source</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!canVerify}
                                      onClick={(e) => { e.stopPropagation(); if (canVerify) onToggleVerifyRadarItem(item.id); }}
                                      title={canVerify ? 'Toggle verification status' : 'Open source link first to unlock verification'}
                                      className="btn btn-secondary btn-sm"
                                    >
                                      {item.verified ? 'Verified ✓' : 'Mark verified'}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
          setExpandedId(null);
          setTrackingItem(null);
        }}
      />
    </div>
  );
}
