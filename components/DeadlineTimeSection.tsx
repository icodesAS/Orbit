'use client';

import React from 'react';
import { TIME_PRESETS } from '@/lib/deadline-picker-utils';

interface DeadlineTimeSectionProps {
  parsed: Date | null;
  h12: number;
  minutes: number;
  isPm: boolean;
  onHourChange: (raw: string) => void;
  onMinuteChange: (raw: string) => void;
  onHourStep: (delta: number) => void;
  onMinuteStep: (delta: number) => void;
  onToggleAmPm: (pm: boolean) => void;
  onSelectPreset: (tp: { h12: number; m: number; pm: boolean }) => void;
}

export function DeadlineTimeSection({
  parsed, h12, minutes, isPm,
  onHourChange, onMinuteChange, onHourStep, onMinuteStep,
  onToggleAmPm, onSelectPreset,
}: DeadlineTimeSectionProps) {
  return (
    <div className={`px-3 py-2.5 space-y-2 ${!parsed ? 'opacity-45 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
          {parsed ? 'TIME' : 'PICK A DATE FIRST'}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            aria-label="Hours (1-12)"
            value={String(h12).padStart(2, '0')}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onHourChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') { e.preventDefault(); onHourStep(1); }
              else if (e.key === 'ArrowDown') { e.preventDefault(); onHourStep(-1); }
            }}
            className="input !w-11 !h-[28px] !px-1 text-center font-mono text-[12.5px]"
          />
          <span className="text-ink-3 font-mono text-xs">:</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Minutes (0-59)"
            value={String(minutes).padStart(2, '0')}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onMinuteChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') { e.preventDefault(); onMinuteStep(5); }
              else if (e.key === 'ArrowDown') { e.preventDefault(); onMinuteStep(-5); }
            }}
            className="input !w-11 !h-[28px] !px-1 text-center font-mono text-[12.5px]"
          />
          <div className="ml-1 flex p-0.5 rounded-[6px] bg-sunken border border-line">
            <button
              type="button"
              onClick={() => onToggleAmPm(false)}
              className={`px-1.5 h-[22px] rounded-[4px] font-mono text-[11px] transition-colors ${
                !isPm ? 'bg-overlay text-ink shadow-[var(--shadow-xs)] font-medium' : 'text-ink-3 hover:text-ink'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => onToggleAmPm(true)}
              className={`px-1.5 h-[22px] rounded-[4px] font-mono text-[11px] transition-colors ${
                isPm ? 'bg-overlay text-ink shadow-[var(--shadow-xs)] font-medium' : 'text-ink-3 hover:text-ink'
              }`}
            >
              PM
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        {TIME_PRESETS.map((tp) => {
          const active = parsed && h12 === tp.h12 && minutes === tp.m && isPm === tp.pm;
          return (
            <button
              key={tp.label}
              type="button"
              onClick={() => onSelectPreset(tp)}
              className={`flex-1 h-6 rounded-[6px] font-mono text-[11px] transition-colors ${
                active ? 'bg-pressed text-ink font-medium' : 'text-ink-3 hover:bg-hover hover:text-ink'
              }`}
            >
              {tp.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
