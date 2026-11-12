import { ArsenalProject, Opportunity, SubTask, AIChatMessage } from './types';
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

const VALID_STATUSES = new Set(['active', 'waitlist', 'submitted', 'archived']);
const VALID_TYPES = new Set(['hackathon', 'fellowship', 'ambassador', 'waitlist', 'other']);
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,128}$/;

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
    .map((o: any, idx: number) => {
      const safeId = typeof o.id === 'string' && SAFE_ID_RE.test(o.id) ? o.id : generateId('opp');
      const safeStatus = VALID_STATUSES.has(o.status) ? o.status : 'active';
      const safeType = VALID_TYPES.has(o.type) ? o.type : 'other';

      const tasks: SubTask[] = Array.isArray(o.tasks)
        ? o.tasks
            .filter((t: any) => t && typeof t.title === 'string' && t.title.trim())
            .map((t: any, tIdx: number) => ({
              id: typeof t.id === 'string' && SAFE_ID_RE.test(t.id) ? t.id : generateId('t'),
              title: String(t.title).trim(),
              done: Boolean(t.done),
              sortOrder: typeof t.sortOrder === 'number' ? t.sortOrder : tIdx + 1,
              createdAt: typeof t.createdAt === 'string' ? t.createdAt : now,
            }))
        : [];

      const aiChat: AIChatMessage[] = Array.isArray(o.aiChat)
        ? o.aiChat
            .filter((m: any) => m && typeof m.content === 'string' && m.content.trim())
            .map((m: any) => ({
              id: typeof m.id === 'string' && SAFE_ID_RE.test(m.id) ? m.id : generateId('msg'),
              role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
              content: String(m.content).trim(),
              createdAt: typeof m.createdAt === 'string' ? m.createdAt : now,
              sources: Array.isArray(m.sources) ? m.sources : undefined,
            }))
        : [];

      return {
        id: safeId,
        code: typeof o.code === 'string' && o.code ? o.code : `ORB-${String(idx + 1).padStart(2, '0')}`,
        title: String(o.title).trim(),
        organization: typeof o.organization === 'string' ? o.organization.trim() : 'General',
        type: safeType,
        status: safeStatus,
        deadline: typeof o.deadline === 'string' ? o.deadline : null,
        progress: typeof o.progress === 'number' ? o.progress : 0,
        tasksDone: tasks.filter((t) => t.done).length,
        tasksTotal: tasks.length,
        projectIds: Array.isArray(o.projectIds) ? o.projectIds.filter((p: any) => typeof p === 'string' && SAFE_ID_RE.test(p)) : [],
        url: typeof o.url === 'string' ? o.url : null,
        urlHash: typeof o.urlHash === 'string' ? o.urlHash : o.url ? computeUrlHash(o.url) : '',
        applicationCopy: typeof o.applicationCopy === 'string' ? o.applicationCopy : null,
        notes: typeof o.notes === 'string' ? o.notes : null,
        sourceRadarDate: typeof o.sourceRadarDate === 'string' ? o.sourceRadarDate : null,
        sortOrder: typeof o.sortOrder === 'number' ? o.sortOrder : idx,
        createdAt: typeof o.createdAt === 'string' ? o.createdAt : now,
        updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : now,
        lastActivityAt: typeof o.lastActivityAt === 'string' ? o.lastActivityAt : now,
        tasks,
        aiChat,
      };
    });

  const projects: ArsenalProject[] = rawProjs
    .filter((p: any) => p && typeof p.title === 'string' && p.title.trim())
    .map((p: any) => ({
      id: typeof p.id === 'string' && SAFE_ID_RE.test(p.id) ? p.id : generateId('proj'),
      title: String(p.title).trim(),
      description: typeof p.description === 'string' ? p.description : '',
      contextBlurb: typeof p.contextBlurb === 'string' ? p.contextBlurb : '',
      techStack: Array.isArray(p.techStack) ? p.techStack.filter((s: any) => typeof s === 'string') : [],
      urls: Array.isArray(p.urls) ? p.urls.filter((u: any) => typeof u === 'string') : [],
      usedInCount: typeof p.usedInCount === 'number' ? p.usedInCount : 0,
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
      updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : now,
    }));

  return { opportunities, projects };
}
