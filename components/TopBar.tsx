'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { ThemeToggle } from './ThemeToggle';

interface TopBarProps {
  opportunities: Opportunity[];
  isGuest?: boolean;
  onOpenCommandPalette: () => void;
  onJumpToOpportunity?: (id: string) => void;
}

export default function TopBar({
  opportunities,
  isGuest = false,
  onOpenCommandPalette,
  onJumpToOpportunity,
}: TopBarProps) {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const activeWithDeadlines = opportunities
    .filter((o) => (o.status === 'active' || o.status === 'waitlist') && o.deadline)
    .map((o) => ({
      opp: o,
      info: getDeadlineInfo(o.deadline, o.status),
    }))
    .filter((item) => (item.info.hoursRemaining ?? -999) > 0)
    .sort((a, b) => (a.info.hoursRemaining ?? 999) - (b.info.hoursRemaining ?? 999));

  const earliest = activeWithDeadlines[0] || null;
  const hrs = earliest?.info.hoursRemaining ?? null;

  let dotClass = 'dot';
  if (hrs !== null) {
    if (hrs <= 6) dotClass = 'dot dot-bad';
    else if (hrs <= 24) dotClass = 'dot dot-warn';
    else if (hrs <= 72) dotClass = 'dot dot-ok';
  }

  return (
    <header className="h-12 bg-canvas border-b border-line px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Ghost search trigger */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="flex items-center justify-between gap-2 px-2.5 h-8 w-full max-w-[360px] rounded-[8px] border border-line bg-transparent hover:bg-raised text-ink-3 hover:text-ink text-[13px] transition-colors text-left"
        title="Search (⌘K)"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-ink-3 shrink-0" />
          <span className="truncate">Search</span>
        </span>
        <span className="kbd shrink-0">⌘K</span>
      </button>

      {/* Right metadata */}
      <div className="flex items-center gap-3 text-xs shrink-0">
        {isGuest && (
          <>
            <span className="hidden md:inline font-mono text-[11.5px] text-ink-3">
              Guest, saved on this device
            </span>
            <span className="hidden md:inline h-3 w-px bg-line" aria-hidden="true" />
          </>
        )}

        <span className="hidden sm:inline font-mono text-[12px] text-ink-3 tabular-nums">
          {todayFormatted}
        </span>

        <span className="hidden sm:inline h-3 w-px bg-line" aria-hidden="true" />

        <div className="flex items-center gap-1.5 font-mono text-[12px] text-ink-3">
          <span className={dotClass} aria-hidden="true" />
          <span>Next:</span>
          {earliest && (hrs ?? 999) <= 72 ? (
            <button
              type="button"
              onClick={() => onJumpToOpportunity && onJumpToOpportunity(earliest.opp.id)}
              className="hover:underline font-mono tabular-nums"
              title={`Jump to ${earliest.opp.title}`}
            >
              <span
                className={
                  hrs !== null && hrs <= 6
                    ? 'text-bad font-medium'
                    : hrs !== null && hrs <= 24
                    ? 'text-warn font-medium'
                    : 'text-ink-2'
                }
              >
                {earliest.info.relativeLabel}
              </span>
            </button>
          ) : (
            <span className="font-mono text-ink-3">none in 72h</span>
          )}
        </div>

        <span className="hidden sm:inline h-3 w-px bg-line" aria-hidden="true" />
        <ThemeToggle variant="icon" />
      </div>
    </header>
  );
}
