import { ArsenalProject, Opportunity, RadarDay, SettingsProfile } from './types';
import { createInitialDemoData } from '@/demo/demoData';
import { DEFAULT_GEMINI_MODEL } from './config';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'orbit_demo_v1_opportunities',
  PROJECTS: 'orbit_demo_v1_projects',
  RADAR_DAYS: 'orbit_demo_v1_radardays',
  SETTINGS: 'orbit_demo_v1_settings',
  INITIALIZED_AT: 'orbit_demo_v1_initialized_at',
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
  resetDemoData: () => OrbitStoreState;
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

  loadState(): OrbitStoreState {
    if (typeof window === 'undefined') {
      const initial = createInitialDemoData();
      return {
        opportunities: initial.opportunities,
        projects: initial.projects,
        radarDays: initial.radarDays,
        settings: getDefaultSettings(),
        isLive: false,
      };
    }

    try {
      const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      const storedProjs = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedRadar = localStorage.getItem(STORAGE_KEYS.RADAR_DAYS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      if (storedOpps && storedProjs && storedRadar) {
        return {
          opportunities: JSON.parse(storedOpps),
          projects: JSON.parse(storedProjs),
          radarDays: JSON.parse(storedRadar),
          settings: storedSettings ? JSON.parse(storedSettings) : getDefaultSettings(),
          isLive: false,
        };
      }
    } catch {
      // Fallback on parse failure
    }

    return this.resetDemoData();
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

  resetDemoData(): OrbitStoreState {
    const nowMs = Date.now();
    const initial = createInitialDemoData(nowMs);
    const settings = getDefaultSettings();

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(initial.opportunities));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initial.projects));
        localStorage.setItem(STORAGE_KEYS.RADAR_DAYS, JSON.stringify(initial.radarDays));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED_AT, String(nowMs));
      } catch {
        // Ignore quota errors
      }
    }

    return {
      opportunities: initial.opportunities,
      projects: initial.projects,
      radarDays: initial.radarDays,
      settings,
      isLive: false,
    };
  }
}

// LiveStore (Firestore) stub for Phase G
class LiveStoreStub implements OrbitDataStore {
  private demoFallback = new DemoStore();

  isLive(): boolean {
    return true;
  }

  loadState(): OrbitStoreState {
    // Phase G will implement Firestore live sync. For now, fallback cleanly.
    return {
      ...this.demoFallback.loadState(),
      isLive: true,
    };
  }

  saveOpportunities(opps: Opportunity[]): void {
    this.demoFallback.saveOpportunities(opps);
  }

  saveProjects(projs: ArsenalProject[]): void {
    this.demoFallback.saveProjects(projs);
  }

  saveRadarDays(days: RadarDay[]): void {
    this.demoFallback.saveRadarDays(days);
  }

  saveSettings(settings: SettingsProfile): void {
    this.demoFallback.saveSettings(settings);
  }

  resetDemoData(): OrbitStoreState {
    return {
      ...this.demoFallback.resetDemoData(),
      isLive: true,
    };
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
