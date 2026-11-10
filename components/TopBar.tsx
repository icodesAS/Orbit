'use client';

import React from 'react';
import { Search, Clock, Calendar } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import OpportunityHeatChip from './OpportunityHeatChip';

interface TopBarProps {
  opportunities: Opportunity[];
  onOpenCommandPalette: () => void;
  onJumpToOpportunity?: (id: string) => void;
}

export default function TopBar({
  opportunities,
  onOpenCommandPalette,
  onJumpToOpportunity,
}: TopBarProps) {
  // Current date in local timezone
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Find earliest active deadline
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
    <header className="h-12 bg-white border-b border-[#E5E5E1] px-4 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Search Trigger */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#E5E5E1] bg-[#F5F5F3] hover:bg-white text-[#6B7280] hover:text-[#16181D] text-xs transition-colors w-64 sm:w-80 justify-between text-left group"
        title="Quick search (Ctrl+K or ⌘K)"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#16181D] shrink-0" />
          <span className="truncate">Search opportunities, projects...</span>
        </span>
        <kbd className="font-mono text-[10px] text-[#6B7280] bg-white border border-[#E5E5E1] px-1.5 py-0.5 rounded shadow-2xs shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Date & Next Deadline */}
      <div className="flex items-center gap-4 text-xs">
        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-[#6B7280] font-mono text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>{todayFormatted}</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-[#E5E5E1]" aria-hidden="true" />

        {/* Next Deadline */}
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280] text-[11px] hidden md:inline font-mono">Next:</span>
          {earliest ? (
            <button
              type="button"
              onClick={() => onJumpToOpportunity && onJumpToOpportunity(earliest.opp.id)}
              className="flex items-center gap-1.5 hover:opacity-85 transition-opacity text-left"
              title={`Jump to ${earliest.opp.code} - ${earliest.opp.title}`}
            >
              <span className="font-mono text-[11px] text-[#16181D] font-medium hidden lg:inline truncate max-w-[140px]">
                {earliest.opp.code}
              </span>
              <OpportunityHeatChip deadlineInfo={earliest.info} />
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280]">
              <Clock className="w-3 h-3 text-[#6B7280]" />
              <span>None in 72h</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
