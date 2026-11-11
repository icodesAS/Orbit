export type DeadlineHeat = 'red' | 'amber' | 'grey' | 'submitted' | 'none';

export interface DeadlineInfo {
  heat: DeadlineHeat;
  relativeLabel: string;
  absoluteLabel: string;
  hoursRemaining: number | null;
  isUrgent72h: boolean;
}

export function getDeadlineInfo(
  deadlineIso: string | null,
  status?: string
): DeadlineInfo {
  if (!deadlineIso) {
    return {
      heat: 'none',
      relativeLabel: 'TBD',
      absoluteLabel: 'No date',
      hoursRemaining: null,
      isUrgent72h: false,
    };
  }

  const now = new Date();
  const target = new Date(deadlineIso);
  if (isNaN(target.getTime())) {
    return {
      heat: 'none',
      relativeLabel: 'TBD',
      absoluteLabel: 'No date',
      hoursRemaining: null,
      isUrgent72h: false,
    };
  }
  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const absoluteLabel = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (status === 'submitted') {
    return {
      heat: 'submitted',
      relativeLabel: 'LOCKED',
      absoluteLabel,
      hoursRemaining: diffHours,
      isUrgent72h: false,
    };
  }

  if (diffHours <= 0) {
    const pastHours = Math.abs(Math.round(diffHours));
    return {
      heat: 'red',
      relativeLabel: pastHours < 24 ? `${pastHours}h overdue` : `${Math.floor(pastHours / 24)}d ago`,
      absoluteLabel,
      hoursRemaining: diffHours,
      isUrgent72h: true,
    };
  }

  if (diffHours <= 24) {
    const wholeHours = Math.floor(diffHours);
    const mins = Math.max(1, Math.floor((diffHours - wholeHours) * 60));
    return {
      heat: 'red',
      relativeLabel: wholeHours > 0 ? `${wholeHours}h ${mins}m` : `${mins}m left`,
      absoluteLabel,
      hoursRemaining: diffHours,
      isUrgent72h: true,
    };
  }

  if (diffHours <= 72) {
    const days = Math.floor(diffHours / 24);
    const remHours = Math.floor(diffHours % 24);
    return {
      heat: 'amber',
      relativeLabel: `${days}d ${remHours}h`,
      absoluteLabel,
      hoursRemaining: diffHours,
      isUrgent72h: true,
    };
  }

  const days = Math.ceil(diffHours / 24);
  return {
    heat: 'grey',
    relativeLabel: `${days}d`,
    absoluteLabel,
    hoursRemaining: diffHours,
    isUrgent72h: false,
  };
}
