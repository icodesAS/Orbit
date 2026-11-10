import { ArsenalProject, Opportunity, RadarDay, SettingsProfile } from './types';
import { DEFAULT_GEMINI_MODEL } from './config';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'orbit_demo_v1_opportunities',
  PROJECTS: 'orbit_demo_v1_projects',
  RADAR_DAYS: 'orbit_demo_v1_radardays',
  SETTINGS: 'orbit_demo_v1_settings',
};

export interface OrbitStoreState {
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  radarDays: RadarDay[];
  settings: SettingsProfile;
  isLive: boolean;
}

export interface OrbitDataStore {
  isLive: () => boolean;
  loadState: () => OrbitStoreState;
  saveOpportunities: (opps: Opportunity[]) => void;
  saveProjects: (projs: ArsenalProject[]) => void;
  saveRadarDays: (days: RadarDay[]) => void;
  saveSettings: (settings: SettingsProfile) => void;
  loadSampleData: () => Promise<OrbitStoreState>;
  removeSampleData: () => OrbitStoreState;
}

function getDefaultSettings(): SettingsProfile {
  return {
    geminiModel: DEFAULT_GEMINI_MODEL,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    updatedAt: new Date().toISOString(),
  };
}

class DemoStore implements OrbitDataStore {
  isLive(): boolean {
    return false;
  }

  // Default workspace starts completely EMPTY
  loadState(): OrbitStoreState {
    const defaultState: OrbitStoreState = {
      opportunities: [],
      projects: [],
      radarDays: [],
      settings: getDefaultSettings(),
      isLive: false,
    };

    if (typeof window === 'undefined') {
      return defaultState;
    }

    try {
      const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      const storedProjs = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedRadar = localStorage.getItem(STORAGE_KEYS.RADAR_DAYS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      return {
        opportunities: storedOpps ? JSON.parse(storedOpps) : [],
        projects: storedProjs ? JSON.parse(storedProjs) : [],
        radarDays: storedRadar ? JSON.parse(storedRadar) : [],
        settings: storedSettings ? JSON.parse(storedSettings) : getDefaultSettings(),
        isLive: false,
      };
    } catch {
      return defaultState;
    }
  }

  saveOpportunities(opps: Opportunity[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opps));
    } catch {
      // Ignore quota errors in demo mode
    }
  }

  saveProjects(projs: ArsenalProject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projs));
    } catch {
      // Ignore quota errors
    }
  }

  saveRadarDays(days: RadarDay[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RADAR_DAYS, JSON.stringify(days));
    } catch {
      // Ignore quota errors
    }
  }

  saveSettings(settings: SettingsProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }

  // Opt-in sample data loader via dynamic import
  async loadSampleData(): Promise<OrbitStoreState> {
    const { createInitialDemoData } = await import('@/demo/demoData');
    const sample = createInitialDemoData(Date.now());
    const currentState = this.loadState();

    const existingOppIds = new Set(currentState.opportunities.map((o) => o.id));
    const newOpps = [
      ...currentState.opportunities,
      ...sample.opportunities.filter((o) => !existingOppIds.has(o.id)),
    ];

    const existingProjIds = new Set(currentState.projects.map((p) => p.id));
    const newProjs = [
      ...currentState.projects,
      ...sample.projects.filter((p) => !existingProjIds.has(p.id)),
    ];

    const newRadar = sample.radarDays;

    this.saveOpportunities(newOpps);
    this.saveProjects(newProjs);
    this.saveRadarDays(newRadar);

    return {
      opportunities: newOpps,
      projects: newProjs,
      radarDays: newRadar,
      settings: currentState.settings,
      isLive: false,
    };
  }

  // Removes ONLY items where isSample === true; custom created items remain intact
  removeSampleData(): OrbitStoreState {
    const currentState = this.loadState();
    const cleanOpps = currentState.opportunities.filter((o) => !o.isSample);
    const cleanProjs = currentState.projects.filter((p) => !p.isSample);
    const cleanRadar = currentState.radarDays
      .filter((d) => !d.isSample)
      .map((day) => ({
        ...day,
        items: day.items.filter((i) => !i.isSample),
      }))
      .filter((day) => day.items.length > 0);

    this.saveOpportunities(cleanOpps);
    this.saveProjects(cleanProjs);
    this.saveRadarDays(cleanRadar);

    return {
      opportunities: cleanOpps,
      projects: cleanProjs,
      radarDays: cleanRadar,
      settings: currentState.settings,
      isLive: false,
    };
  }
}

// LiveStore (Firestore) stub for Phase G - sample feature hidden and never loads sample data
class LiveStoreStub implements OrbitDataStore {
  isLive(): boolean {
    return true;
  }

  loadState(): OrbitStoreState {
    return {
      opportunities: [],
      projects: [],
      radarDays: [],
      settings: getDefaultSettings(),
      isLive: true,
    };
  }

  saveOpportunities(): void {}
  saveProjects(): void {}
  saveRadarDays(): void {}
  saveSettings(): void {}

  async loadSampleData(): Promise<OrbitStoreState> {
    return this.loadState();
  }

  removeSampleData(): OrbitStoreState {
    return this.loadState();
  }
}

export function isFirebaseConfigured(): boolean {
  if (typeof process === 'undefined') return false;
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function getOrbitStore(): OrbitDataStore {
  if (isFirebaseConfigured()) {
    return new LiveStoreStub();
  }
  return new DemoStore();
}
