import { ArsenalProject, Opportunity, RadarDay } from '@/lib/types';
import { createDemoProjects } from './demoProjects';
import { createDemoOpportunities } from './demoOpportunities';
import { createDemoRadarDays } from './demoRadar';

export function createInitialDemoData(nowMs: number = Date.now()): {
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  radarDays: RadarDay[];
} {
  const projects = createDemoProjects(nowMs);
  const opportunities = createDemoOpportunities(nowMs);
  const radarDays = createDemoRadarDays(nowMs);

  return { opportunities, projects, radarDays };
}
