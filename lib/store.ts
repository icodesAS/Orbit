import { ArsenalProject, Opportunity, RadarDay, SettingsProfile } from './types';
import { DEFAULT_GEMINI_MODEL } from './config';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'orbit_guest_v1_opportunities',
  PROJECTS: 'orbit_guest_v1_projects',
  RADAR_DAYS: 'orbit_guest_v1_radardays',
  SETTINGS: 'orbit_guest_v1_settings',
  GUEST_ACTIVE: 'orbit_guest_v1_active',
};

export interface OrbitStoreState {
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  radarDays: RadarDay[];
  settings: SettingsProfile;
}

export interface OrbitDataStore {
  loadState: () => OrbitStoreState;
  saveOpportunities: (opps: Opportunity[]) => void;
  saveProjects: (projs: ArsenalProject[]) => void;
  saveRadarDays: (days: RadarDay[]) => void;
  saveSettings: (settings: SettingsProfile) => void;
  clearLocalData: () => void;
  isGuestSessionActive: () => boolean;
  setGuestSessionActive: (active: boolean) => void;
}

function getDefaultSettings(): SettingsProfile {
  return {
    geminiModel: DEFAULT_GEMINI_MODEL,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    updatedAt: new Date().toISOString(),
  };
}

class GuestStore implements OrbitDataStore {
  loadState(): OrbitStoreState {
    const defaultState: OrbitStoreState = {
      opportunities: [],
      projects: [],
      radarDays: [],
      settings: getDefaultSettings(),
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
      // Ignore storage quota errors
    }
  }

  saveProjects(projs: ArsenalProject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projs));
    } catch {
      // Ignore storage quota errors
    }
  }

  saveRadarDays(days: RadarDay[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RADAR_DAYS, JSON.stringify(days));
    } catch {
      // Ignore storage quota errors
    }
  }

  saveSettings(settings: SettingsProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }

  clearLocalData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.OPPORTUNITIES);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.RADAR_DAYS);
    } catch {
      // Ignore storage errors
    }
  }

  isGuestSessionActive(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (localStorage.getItem(STORAGE_KEYS.GUEST_ACTIVE) === 'true') return true;
      const opps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      const projs = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (opps && JSON.parse(opps).length > 0) return true;
      if (projs && JSON.parse(projs).length > 0) return true;
      return false;
    } catch {
      return false;
    }
  }

  setGuestSessionActive(active: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      if (active) {
        localStorage.setItem(STORAGE_KEYS.GUEST_ACTIVE, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.GUEST_ACTIVE);
      }
    } catch {
      // Ignore storage errors
    }
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
  return new GuestStore();
}
