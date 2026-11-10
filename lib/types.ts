export type OpportunityType = 'hackathon' | 'fellowship' | 'ambassador' | 'waitlist' | 'other';

export type OpportunityStatus = 'active' | 'waitlist' | 'submitted' | 'archived';

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
  code: string; // e.g., ORB-01
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
  urlHash: string;
  applicationCopy: string | null;
  notes: string | null;
  sourceRadarDate: string | null;
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
  contextBlurb: string;
  techStack: string[];
  urls: { label: string; url: string }[];
  usedInCount: number;
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
  verified: boolean;
  promoted: boolean;
  recommendedProjectId?: string;
  createdAt: string;
}

export interface UndoAction {
  id: string;
  message: string;
  timestamp: number;
  restore: () => void;
}
