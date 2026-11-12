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
        className="chip chip-bad whitespace-nowrap shrink-0"
        title={`Urgent (<=24h): Due ${deadlineInfo.absoluteLabel}`}
      >
        <span className="dot dot-bad shrink-0" aria-hidden="true" />
        <span>{deadlineInfo.relativeLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  if (deadlineInfo.heat === 'amber') {
    return (
      <span
        className="chip chip-warn whitespace-nowrap shrink-0"
        title={`Approaching (<=3 days): Due ${deadlineInfo.absoluteLabel}`}
      >
        <span>{deadlineInfo.relativeLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  if (deadlineInfo.heat === 'submitted') {
    return (
      <span
        className="chip chip-ok whitespace-nowrap shrink-0"
        title={`Submitted (${deadlineInfo.absoluteLabel})`}
      >
        <span>{deadlineInfo.relativeLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{deadlineInfo.absoluteLabel}</span>
      </span>
    );
  }

  return (
    <span
      className="chip whitespace-nowrap shrink-0"
      title={`Due ${deadlineInfo.absoluteLabel}`}
    >
      <span>{deadlineInfo.relativeLabel}</span>
      <span aria-hidden="true">·</span>
      <span>{deadlineInfo.absoluteLabel}</span>
    </span>
  );
}
