'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  parseValue, toValue, applyDay, setTime12, addCalendarDays,
  isSameCalendarDay, formatTriggerLabel, formatRelativeHint,
  getMonthGrid, QUICK_PRESETS, parseHourInput, parseMinuteInput,
} from '@/lib/deadline-picker-utils';
import { DeadlineTimeSection } from './DeadlineTimeSection';
import { dur, ease } from '@/lib/motion';

export interface DeadlinePickerProps {
  value: string | null;
  onChange: (next: string | null) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const emptySubscribe = () => () => {};

export function DeadlinePicker({
  value, onChange, id, placeholder = 'No deadline', disabled = false, invalid = false,
}: DeadlinePickerProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);
  const [now] = useState(() => new Date());
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const [viewYear, setViewYear] = useState(() => (parsed ?? now).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parsed ?? now).getMonth());

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hours24 = parsed ? parsed.getHours() : 23;
  const minutes = parsed ? parsed.getMinutes() : 59;
  const isPm = hours24 >= 12;
  const h12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const syncMonthToValue = () => {
    const target = parseValue(value) ?? new Date();
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverH = 410;
    const popoverW = 304;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const spaceBelow = vh - rect.bottom - 10;
    const spaceAbove = rect.top - 10;
    let top = rect.bottom + 6;
    if (spaceBelow < popoverH && spaceAbove > spaceBelow) {
      top = Math.max(8, rect.top - popoverH - 6);
    } else {
      top = Math.max(8, Math.min(rect.bottom + 6, vh - popoverH - 8));
    }
    const left = Math.max(8, Math.min(rect.left, vw - popoverW - 8));
    setCoords({ top, left });
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!open) { syncMonthToValue(); updatePosition(); }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(t) && popoverRef.current && !popoverRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open]);

  const handleKeyDownPopover = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); triggerRef.current?.focus(); }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) { syncMonthToValue(); updatePosition(); setOpen(true); }
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && value) {
      e.preventDefault();
      onChange(null);
    }
  };

  const selectDay = (day: Date) => {
    const nextDate = applyDay(parsed, day);
    setViewYear(nextDate.getFullYear());
    setViewMonth(nextDate.getMonth());
    onChange(toValue(nextDate));
  };

  const handleQuickPreset = (days: number | null) => {
    if (days === null) { onChange(null); setOpen(false); return; }
    onChange(toValue(applyDay(parsed, addCalendarDays(new Date(), days))));
    setOpen(false);
  };

  const handleHourChange = (raw: string) => {
    if (parsed) onChange(toValue(setTime12(parsed, parseHourInput(raw, h12), minutes, isPm)));
  };
  const handleMinuteChange = (raw: string) => {
    if (parsed) onChange(toValue(setTime12(parsed, h12, parseMinuteInput(raw, minutes), isPm)));
  };
  const handleHourStep = (d: number) => {
    if (parsed) onChange(toValue(setTime12(parsed, h12 + d > 12 ? 1 : h12 + d < 1 ? 12 : h12 + d, minutes, isPm)));
  };
  const handleMinuteStep = (d: number) => {
    if (parsed) onChange(toValue(setTime12(parsed, h12, (minutes + d + 60) % 60, isPm)));
  };

  const changeMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const gridCells = getMonthGrid(viewYear, viewMonth, now);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isOverdue = parsed ? parsed.getTime() < now.getTime() : false;
  const relText = parsed ? formatRelativeHint(parsed, now) : '';

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDownPopover}>
      <div
        className={`input flex items-center justify-between gap-1.5 pr-1.5 ${
          open ? 'border-accent/55 ring-3 ring-accent-ring' : ''
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        aria-invalid={invalid || undefined}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={handleToggleOpen}
          onKeyDown={handleTriggerKeyDown}
          className="flex-1 flex items-center gap-2 text-left h-full min-w-0 focus:outline-none"
        >
          <Calendar className="w-3.5 h-3.5 text-ink-3 shrink-0" />
          {parsed ? (
            <span className="truncate text-[13.5px] flex items-center gap-1.5">
              <span className={isOverdue ? 'text-bad font-medium' : 'text-ink'}>{formatTriggerLabel(parsed)}</span>
              <span className="text-ink-3 text-[12px] font-mono">· {relText}</span>
            </span>
          ) : (
            <span className="text-ink-4 text-[13.5px] truncate">{placeholder}</span>
          )}
        </button>

        {parsed && !disabled && (
          <button
            type="button"
            aria-label="Clear deadline"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="w-[22px] h-[22px] rounded-[4px] flex items-center justify-center text-ink-3 hover:text-ink hover:bg-hover transition-colors shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isClient && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && coords && (
            <div
              ref={popoverRef}
              style={{ position: 'fixed', top: `${coords.top}px`, left: `${coords.left}px`, zIndex: 100 }}
              onKeyDown={handleKeyDownPopover}
            >
              <motion.div
                role="dialog"
                aria-label="Choose deadline"
                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: dur.fast, ease: ease.out } }}
                exit={{ opacity: 0, scale: 0.98, y: 2, transition: { duration: 0.1 } }}
                className="w-[304px] max-h-[calc(100vh-20px)] rounded-[12px] bg-overlay border border-line shadow-[var(--shadow-pop)] overflow-y-auto select-none flex flex-col"
              >
                <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((pill) => {
                    const isActive = pill.days === null ? !parsed : isSameCalendarDay(parsed, addCalendarDays(now, pill.days));
                    return (
                      <button key={pill.id} type="button" onClick={() => handleQuickPreset(pill.days)}
                        className={`h-[26px] px-2.5 rounded-full text-[12px] font-medium border transition-colors ${
                          isActive ? 'bg-primary text-primary-fg border-primary' : 'bg-overlay text-ink-2 border-line hover:bg-hover hover:text-ink'
                        }`}
                      >{pill.label}</button>
                    );
                  })}
                </div>

                <div className="h-px bg-line" />

                <div className="px-3 pt-2 pb-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13.5px] font-semibold text-ink pl-1">{monthLabel}</span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="btn btn-ghost btn-icon">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="btn btn-ghost btn-icon">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className="h-6 flex items-center justify-center font-mono text-[11px] text-ink-3">{wd}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5">
                    {gridCells.map((cell, idx) => {
                      const selected = isSameCalendarDay(cell.date, parsed);
                      return (
                        <button key={idx} type="button" onClick={() => selectDay(cell.date)}
                          className={`relative h-8 rounded-[8px] text-[12.5px] font-mono flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                            selected ? 'bg-primary text-primary-fg font-semibold' : cell.inCurrentMonth ? 'text-ink hover:bg-hover' : 'text-ink-4 hover:bg-hover'
                          } ${cell.isToday && !selected ? 'font-semibold' : ''}`}
                        >
                          {cell.date.getDate()}
                          {cell.isToday && <span className={`absolute bottom-1 w-[3px] h-[3px] rounded-full ${selected ? 'bg-primary-fg' : 'bg-accent'}`} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-line" />

                <DeadlineTimeSection
                  parsed={parsed}
                  h12={h12}
                  minutes={minutes}
                  isPm={isPm}
                  onHourChange={handleHourChange}
                  onMinuteChange={handleMinuteChange}
                  onHourStep={handleHourStep}
                  onMinuteStep={handleMinuteStep}
                  onToggleAmPm={(pm) => parsed && onChange(toValue(setTime12(parsed, h12, minutes, pm)))}
                  onSelectPreset={(tp) => onChange(toValue(setTime12(parsed ?? applyDay(null, new Date()), tp.h12, tp.m, tp.pm)))}
                />

                <div className="px-3 py-2 bg-raised border-t border-line flex items-center justify-between gap-2">
                  <span className="font-mono text-[11.5px] text-ink-2 truncate">{parsed ? `${formatTriggerLabel(parsed)} · ${relText}` : 'No deadline'}</span>
                  <button type="button" onClick={() => setOpen(false)} className="btn btn-primary btn-sm shrink-0">Done</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
