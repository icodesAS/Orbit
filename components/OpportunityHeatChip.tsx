'use client';

import React from 'react';
import { DeadlineInfo } from '@/lib/deadline';
import { Flame, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface OpportunityHeatChipProps {
  deadlineInfo: DeadlineInfo;
}

export default function OpportunityHeatChip({ deadlineInfo }: OpportunityHeatChipProps) {
  if (deadlineInfo.heat === 'red') {
    return (
      <div
        className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-rose-400 font-semibold whitespace-nowrap shrink-0"
        title={`Urgent (<24h): Due ${deadlineInfo.absoluteLabel}`}
      >
        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-zinc-600 font-normal">·</span>
        <span className="text-rose-300/80 font-normal">{deadlineInfo.absoluteLabel}</span>
      </div>
    );
  }

  if (deadlineInfo.heat === 'amber') {
    return (
      <div
        className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-amber-400 font-medium whitespace-nowrap shrink-0"
        title={`Approaching (<=72h): Due ${deadlineInfo.absoluteLabel}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-zinc-600 font-normal">·</span>
        <span className="text-amber-200/80 font-normal">{deadlineInfo.absoluteLabel}</span>
      </div>
    );
  }

  if (deadlineInfo.heat === 'submitted') {
    return (
      <div
        className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-emerald-400 whitespace-nowrap shrink-0"
        title={`Submitted (${deadlineInfo.absoluteLabel})`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{deadlineInfo.relativeLabel}</span>
        <span className="text-zinc-600 font-normal">·</span>
        <span className="text-zinc-400 font-normal">{deadlineInfo.absoluteLabel}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-zinc-400 whitespace-nowrap shrink-0"
      title={`Due ${deadlineInfo.absoluteLabel}`}
    >
      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      <span>{deadlineInfo.relativeLabel}</span>
      <span className="text-zinc-600 font-normal">·</span>
      <span className="text-zinc-500">{deadlineInfo.absoluteLabel}</span>
    </div>
  );
}
