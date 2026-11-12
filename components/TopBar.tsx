'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';

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
  const todayFormatted = new Date().toLocaleDateString(undefined, {
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

  return (
    <header className="h-11 bg-canvas border-b border-line px-4 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Search Input - 30px ghost style */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2 px-2.5 h-[30px] rounded-md border border-line bg-transparent hover:bg-surface text-ink-3 hover:text-ink text-xs transition-colors w-64 sm:w-72 justify-between text-left group"
        title="Search (⌘K)"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-ink-3 shrink-0" />
          <span className="truncate">Search</span>
        </span>
        <span className="font-mono text-[11px] text-ink-3 shrink-0">
          ⌘K
        </span>
      </button>

      {/* Right Side: Date & Next Deadline */}
      <div className="flex items-center gap-3 text-xs">
        {isGuest && (
          <span className="font-mono text-[11px] text-ink-3 whitespace-nowrap shrink-0">
            Guest (local)
          </span>
        )}

        <span className="hidden sm:inline font-mono text-[11.5px] text-ink-3 tabular-nums">
          {todayFormatted}
        </span>

        <span className="hidden sm:inline text-line" aria-hidden="true">·</span>

        <div className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
          <span>Next:</span>
          {earliest ? (
            <button
              type="button"
              onClick={() => onJumpToOpportunity && onJumpToOpportunity(earliest.opp.id)}
              className="hover:underline text-ink font-mono tabular-nums"
              title={`Jump to ${earliest.opp.title}`}
            >
              <span
                className={
                  earliest.info.heat === 'red'
                    ? 'text-urgency-hot'
                    : earliest.info.heat === 'amber'
                    ? 'text-urgency-warn'
                    : 'text-urgency-calm'
                }
              >
                {earliest.info.relativeLabel}
              </span>
            </button>
          ) : (
            <span className="font-mono text-ink-3">none in 72h</span>
          )}
        </div>
      </div>
    </header>
  );
}
