import { ArsenalProject, Opportunity, RadarDay } from './types';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'orbit_guest_v1_opportunities',
  PROJECTS: 'orbit_guest_v1_projects',
  RADAR_DAYS: 'orbit_guest_v1_radardays',
  GUEST_ACTIVE: 'orbit_guest_v1_active',
};

function notifyStorageError(err: unknown) {
  if (typeof window === 'undefined') return;
  const isQuota = err instanceof DOMException && (
    err.code === 22 || err.code === 1014 ||
    err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  );
  window.dispatchEvent(new CustomEvent('orbit:storage-error', {
    detail: isQuota
      ? 'Browser storage quota reached. Export your data or delete unused tracks.'
      : 'Failed to save to local storage.',
  }));
}

function sanitizeOpportunities(data: unknown): Opportunity[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is Opportunity => (
    Boolean(item) && typeof item === 'object' &&
    typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.type === 'string' && typeof item.status === 'string' &&
    Array.isArray(item.tasks) && Array.isArray(item.projectIds)
  ));
}

function sanitizeProjects(data: unknown): ArsenalProject[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is ArsenalProject => (
    Boolean(item) && typeof item === 'object' &&
    typeof item.id === 'string' && typeof item.title === 'string'
  ));
}

function sanitizeRadarDays(data: unknown): RadarDay[] {
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is RadarDay => (
    Boolean(item) && typeof item === 'object' &&
    typeof item.date === 'string' && Array.isArray(item.items)
  ));
}

export interface OrbitStoreState {
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  radarDays: RadarDay[];
}

export interface OrbitDataStore {
  loadState: () => OrbitStoreState;
  saveOpportunities: (opps: Opportunity[]) => void;
  saveProjects: (projs: ArsenalProject[]) => void;
  saveRadarDays: (days: RadarDay[]) => void;
  clearLocalData: () => void;
  isGuestSessionActive: () => boolean;
  setGuestSessionActive: (active: boolean) => void;
}

class GuestStore implements OrbitDataStore {
  loadState(): OrbitStoreState {
    const defaultState: OrbitStoreState = {
      opportunities: [],
      projects: [],
      radarDays: [],
    };

    if (typeof window === 'undefined') return defaultState;

    try {
      const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      const storedProjs = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedRadar = localStorage.getItem(STORAGE_KEYS.RADAR_DAYS);

      return {
        opportunities: storedOpps ? sanitizeOpportunities(JSON.parse(storedOpps)) : [],
        projects: storedProjs ? sanitizeProjects(JSON.parse(storedProjs)) : [],
        radarDays: storedRadar ? sanitizeRadarDays(JSON.parse(storedRadar)) : [],
      };
    } catch {
      return defaultState;
    }
  }

  saveOpportunities(opps: Opportunity[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opps));
    } catch (err) {
      notifyStorageError(err);
    }
  }

  saveProjects(projs: ArsenalProject[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projs));
    } catch (err) {
      notifyStorageError(err);
    }
  }

  saveRadarDays(days: RadarDay[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RADAR_DAYS, JSON.stringify(days));
    } catch (err) {
      notifyStorageError(err);
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
      if (opps && sanitizeOpportunities(JSON.parse(opps)).length > 0) return true;
      if (projs && sanitizeProjects(JSON.parse(projs)).length > 0) return true;
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

export function getOrbitStore(): OrbitDataStore {
  return new GuestStore();
}
