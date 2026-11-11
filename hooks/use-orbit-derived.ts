'use client';

import { useMemo } from 'react';
import { Opportunity, ArsenalProject, RadarDay, RadarItem } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';

export function useOrbitDerived(
  opportunities: Opportunity[],
  projects: ArsenalProject[],
  radarDays: RadarDay[],
  selectedRadarDate: string
) {
  const projectsWithCounts = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      usedInCount: opportunities.filter((o) => o.projectIds.includes(p.id)).length,
    }));
  }, [projects, opportunities]);

  const projectsMap = useMemo(() => {
    const map: Record<string, ArsenalProject> = {};
    projectsWithCounts.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [projectsWithCounts]);

  const availableRadarDates = useMemo(() => radarDays.map((d) => d.date), [radarDays]);

  const activeDay = useMemo(() => {
    if (!radarDays || radarDays.length === 0) return null;
    return (
      (selectedRadarDate && radarDays.find((d) => d.date === selectedRadarDate)) ||
      radarDays[0]
    );
  }, [radarDays, selectedRadarDate]);

  const activeRadarItems: RadarItem[] = useMemo(() => {
    return activeDay && Array.isArray(activeDay.items) ? activeDay.items : [];
  }, [activeDay]);

  const counts = useMemo(() => {
    const activePipeline = opportunities.filter((o) => o.status !== 'archived').length;
    const radarUnreviewed = activeRadarItems.filter((i) => !i.promoted).length;
    const urgent72h = opportunities
      .filter((o) => o.status === 'active' || o.status === 'waitlist')
      .filter((o) => getDeadlineInfo(o.deadline, o.status).isUrgent72h).length;

    return {
      pipeline: activePipeline,
      radarUnreviewed,
      arsenal: projects.length,
      urgent72h,
    };
  }, [opportunities, activeRadarItems, projects]);

  const nextCodeNumber = useMemo(() => {
    let max = 0;
    opportunities.forEach((o) => {
      const match = o.code.match(/ORB-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    });
    return max + 1;
  }, [opportunities]);

  return {
    projectsWithCounts,
    projectsMap,
    availableRadarDates,
    activeDay,
    activeRadarItems,
    counts,
    nextCodeNumber,
  };
}
