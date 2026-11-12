const pad2 = (n: number) => String(n).padStart(2, '0');

export function parseValue(val: string | null | undefined): Date | null {
  if (!val) return null;
  const trimmed = val.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(trimmed);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hours = match[4] !== undefined ? Number(match[4]) : 23;
    const minutes = match[5] !== undefined ? Number(match[5]) : 59;
    const d = new Date(year, month, day, hours, minutes, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function toLocalPickerValue(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? null : toValue(d);
}

export function applyDay(
  prev: Date | null,
  day: Date,
  def = { hours: 23, minutes: 59 }
): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    prev ? prev.getHours() : def.hours,
    prev ? prev.getMinutes() : def.minutes,
    0,
    0
  );
}

export function setTime12(d: Date, h12: number, minutes: number, pm: boolean): Date {
  const clampedH = Math.max(1, Math.min(12, h12 || 12));
  const clampedM = Math.max(0, Math.min(59, minutes || 0));
  const hours24 = (clampedH % 12) + (pm ? 12 : 0);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    hours24,
    clampedM,
    0,
    0
  );
}

export function addCalendarDays(base: Date, days: number): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + days,
    base.getHours(),
    base.getMinutes(),
    0,
    0
  );
}

export function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function differenceInCalendarDays(target: Date, now: Date): number {
  const tStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((tStart - nStart) / 86_400_000);
}

export function formatRelativeHint(d: Date, now: Date = new Date()): string {
  const diff = differenceInCalendarDays(d, now);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff > 1) return `in ${diff} days`;
  if (diff === -1) return '1 day ago';
  return `${-diff} days ago`;
}

export function formatTriggerLabel(d: Date): string {
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthGrid(year: number, month: number, now: Date = new Date()): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sun
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(year, month, 1 - startOffset + i);
    cells.push({
      date: cellDate,
      inCurrentMonth: cellDate.getMonth() === month,
      isToday: isSameCalendarDay(cellDate, now),
    });
  }
  return cells;
}

export const QUICK_PRESETS = [
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: 'in3', label: 'In 3 days', days: 3 },
  { id: 'nextweek', label: 'Next week', days: 7 },
  { id: 'none', label: 'No deadline', days: null },
] as const;

export const TIME_PRESETS = [
  { label: '9:00 AM', h12: 9, m: 0, pm: false },
  { label: '12:00 PM', h12: 12, m: 0, pm: true },
  { label: '6:00 PM', h12: 6, m: 0, pm: true },
  { label: '11:59 PM', h12: 11, m: 59, pm: true },
] as const;
