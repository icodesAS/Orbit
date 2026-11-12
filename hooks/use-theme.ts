'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'orbit_theme';
const THEME_CHANGE_EVENT = 'orbit-theme-change';

function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
  } catch {}
  return 'light';
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
    mql.removeEventListener('change', callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getStoredTheme,
    () => 'light' as ThemePreference
  );

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getStoredTheme();
    const next: ThemePreference = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [setTheme]);

  const resolvedTheme: ResolvedTheme =
    !isMounted || theme === 'light'
      ? 'light'
      : theme === 'dark'
      ? 'dark'
      : typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  return { theme, resolvedTheme, setTheme, toggleTheme, isMounted };
}
