'use client';

import React from 'react';
import { DeadlineInfo } from '@/lib/deadline';

interface OpportunityHeatChipProps {
  deadlineInfo: DeadlineInfo;
}

export default function OpportunityHeatChip({ deadlineInfo }: OpportunityHeatChipProps) {
  if (deadlineInfo.heat === 'red') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-[#D92D20] bg-[#FEE4E2] border border-[#FECDCA] whitespace-nowrap shrink-0"
        title={`Urgent (<=24h): Due ${deadlineInfo.absoluteLabel}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20] shrink-0" aria-hidden="true" />
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-[#D92D20]/50" aria-hidden="true">·</span>
        <span className="text-[#D92D20]/80">{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  if (deadlineInfo.heat === 'amber') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-[#B54708] bg-[#FEF0C7] border border-[#FEDF89] whitespace-nowrap shrink-0"
        title={`Approaching (<=3 days): Due ${deadlineInfo.absoluteLabel}`}
      >
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-[#B54708]/50" aria-hidden="true">·</span>
        <span className="text-[#B54708]/80">{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  if (deadlineInfo.heat === 'submitted') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium text-[#067647] bg-[#ECFDF3] border border-[#D1FADF] whitespace-nowrap shrink-0"
        title={`Submitted (${deadlineInfo.absoluteLabel})`}
      >
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-[#067647]/50" aria-hidden="true">·</span>
        <span className="text-[#067647]/80">{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-normal text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] whitespace-nowrap shrink-0"
      title={`Due ${deadlineInfo.absoluteLabel}`}
    >
      <span>{deadlineInfo.relativeLabel}</span>
      <span className="text-[#6B7280]/50" aria-hidden="true">·</span>
      <span className="text-[#6B7280]/80">{deadlineInfo.absoluteLabel}</span>
    </span>
  );
}
