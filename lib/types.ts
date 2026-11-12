export type OpportunityType = 'hackathon' | 'fellowship' | 'ambassador' | 'waitlist' | 'other';

export type OpportunityStatus = 'active' | 'waitlist' | 'submitted' | 'archived';

export type RadarPriority = '1A' | '1B' | '1C' | '2';

export type RadarOpportunityFormat = 'fresh_build' | 'open_track' | 'unclear';

export type RadarDeadlineConfidence = 'stated' | 'inferred' | 'unknown';

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: { title: string; uri: string }[];
}

export interface Opportunity {
  id: string;
  code: string; // e.g. ORB-01
  title: string;
  organization: string;
  type: OpportunityType;
  status: OpportunityStatus;
  deadline: string | null; // ISO timestamp
  progress: number; // 0-100 denormalized
  tasksDone: number; // denormalized
  tasksTotal: number; // denormalized
  projectIds: string[]; // Arsenal links
  url: string | null;
  urlHash: string; // for deduplication
  applicationCopy: string | null;
  notes: string | null;
  sourceRadarDate: string | null; // yyyy-mm-dd if promoted from radar
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  tasks: SubTask[];
  aiChat: AIChatMessage[];
}

export interface ArsenalProject {
  id: string;
  title: string;
  description: string;
  contextBlurb: string; // ~100 words, plain English, used for radar matching
  techStack: string[];
  urls: { label: string; url: string }[];
  usedInCount: number; // denormalized
  createdAt: string;
  updatedAt: string;
}

export interface RadarItem {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  url: string;
  urlHash: string;
  summary: string;
  deadline: string | null;
  source: string;
  priority: RadarPriority;
  verified: boolean; // only true after user opens source and marks verified
  promoted: boolean; // true when copied to opportunities
  format?: RadarOpportunityFormat;
  deadlineConfidence?: RadarDeadlineConfidence;
  recommendedProjectId?: string;
  createdAt: string;
}

export interface RadarDay {
  date: string; // yyyy-mm-dd
  generatedAt: string;
  model: string;
  itemCount: number;
  items: RadarItem[];
}

export interface UndoAction {
  id: string;
  message: string;
  timestamp: number;
  restore: () => void;
}
