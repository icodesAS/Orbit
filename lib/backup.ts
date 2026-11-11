import { ArsenalProject, Opportunity } from './types';
import { computeUrlHash } from './hash';
import { generateId } from './id';

export interface WorkspaceBackupPayload {
  version: number;
  exportedAt: string;
  opportunities: Opportunity[];
  projects: ArsenalProject[];
}

export function exportWorkspaceJson(opportunities: Opportunity[], projects: ArsenalProject[]): void {
  if (typeof window === 'undefined') return;
  const payload: WorkspaceBackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    opportunities,
    projects,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `orbit-backup-${dateStr}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function parseWorkspaceJson(rawText: string): {
  opportunities: Opportunity[];
  projects: ArsenalProject[];
} {
  const parsed = JSON.parse(rawText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file format.');
  }

  const rawOpps = Array.isArray(parsed.opportunities) ? parsed.opportunities : [];
  const rawProjs = Array.isArray(parsed.projects) ? parsed.projects : [];
  const now = new Date().toISOString();

  const opportunities: Opportunity[] = rawOpps
    .filter((o: any) => o && typeof o.title === 'string' && o.title.trim())
    .map((o: any, idx: number) => ({
      id: typeof o.id === 'string' && o.id ? o.id : generateId('opp'),
      code: typeof o.code === 'string' && o.code ? o.code : `ORB-${String(idx + 1).padStart(2, '0')}`,
      title: String(o.title).trim(),
      organization: typeof o.organization === 'string' ? o.organization.trim() : 'General',
      type: o.type || 'other',
      status: o.status || 'active',
      deadline: o.deadline || null,
      progress: typeof o.progress === 'number' ? o.progress : 0,
      tasksDone: typeof o.tasksDone === 'number' ? o.tasksDone : 0,
      tasksTotal: typeof o.tasksTotal === 'number' ? o.tasksTotal : 0,
      projectIds: Array.isArray(o.projectIds) ? o.projectIds : [],
      url: o.url || null,
      urlHash: o.urlHash || (o.url ? computeUrlHash(o.url) : ''),
      applicationCopy: o.applicationCopy || null,
      notes: o.notes || null,
      sourceRadarDate: o.sourceRadarDate || null,
      sortOrder: typeof o.sortOrder === 'number' ? o.sortOrder : idx,
      createdAt: o.createdAt || now,
      updatedAt: o.updatedAt || now,
      lastActivityAt: o.lastActivityAt || 'imported',
      tasks: Array.isArray(o.tasks) ? o.tasks : [],
      aiChat: Array.isArray(o.aiChat) ? o.aiChat : [],
    }));

  const projects: ArsenalProject[] = rawProjs
    .filter((p: any) => p && typeof p.title === 'string' && p.title.trim())
    .map((p: any) => ({
      id: typeof p.id === 'string' && p.id ? p.id : generateId('proj'),
      title: String(p.title).trim(),
      description: typeof p.description === 'string' ? p.description : '',
      contextBlurb: typeof p.contextBlurb === 'string' ? p.contextBlurb : '',
      techStack: Array.isArray(p.techStack) ? p.techStack : [],
      urls: Array.isArray(p.urls) ? p.urls : [],
      usedInCount: typeof p.usedInCount === 'number' ? p.usedInCount : 0,
      createdAt: p.createdAt || now,
      updatedAt: p.updatedAt || now,
    }));

  return { opportunities, projects };
}
