export type RadarOpportunityFormat = 'fresh_build' | 'open_track' | 'unclear';
export type RadarDeadlineConfidence = 'stated' | 'inferred' | 'unknown';

export interface RadarTierConfig {
  priority: '1A' | '1B' | '1C' | '2';
  name: string;
  focus: string;
  examples: string;
}

export interface BuildRadarDiscoveryPromptParams {
  tier: RadarTierConfig;
  currentDateIso?: string;
  seenUrls?: string[];
}

export interface BuildRadarMatchingPromptParams {
  items: Array<{
    id: string;
    title: string;
    organization?: string;
    summary?: string;
    format?: RadarOpportunityFormat;
  }>;
  arsenalProjects: Array<{
    id: string;
    title: string;
    techStack?: string[];
  }>;
}

export declare const RADAR_TIERS: RadarTierConfig[];
export declare function cleanPromptText(val: unknown, maxLen?: number): string;
export declare function buildRadarDiscoveryPrompt(params: BuildRadarDiscoveryPromptParams): string;
export declare function buildRadarMatchingPrompt(params: BuildRadarMatchingPromptParams): string;
export declare function buildRadarPrompt(params: {
  tier: RadarTierConfig;
  arsenalProjects?: Array<{ id: string; title: string; techStack?: string[] }>;
  seenUrls?: string[];
}): string;

export interface AskActionChip {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export declare const ASK_ACTION_CHIPS: AskActionChip[];

export interface AskLinkedProject {
  title: string;
  techStack?: string[];
  contextBlurb?: string;
}

export interface AskOpportunityInput {
  code?: string;
  title?: string;
  organization?: string;
  type?: string;
  status?: string;
  deadline?: string | null;
  url?: string | null;
  applicationCopy?: string | null;
  notes?: string | null;
  tasksDone?: number;
  tasksTotal?: number;
  tasks?: Array<{ done: boolean; title: string }>;
}

export interface BuildAskSystemInstructionParams {
  opportunity?: AskOpportunityInput;
  linkedProjects?: AskLinkedProject[];
  customRules?: string[];
}

export declare function sanitizeField(val: unknown, maxLen?: number): string;
export declare const DEFAULT_ASK_RULES: string[];
export declare function buildAskSystemInstruction(params: BuildAskSystemInstructionParams): string;
export declare const RADAR_DISCOVERY_JSON_SCHEMA: string;
export declare const RADAR_MATCH_JSON_SCHEMA: string;
