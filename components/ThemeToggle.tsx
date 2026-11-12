'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemePreference } from '@/hooks/use-theme';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, isMounted } = useTheme();

  if (variant === 'segmented') {
    const options: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Monitor },
    ];

    return (
      <div
        role="group"
        aria-label="Theme preference"
        className={`inline-flex items-center p-0.5 rounded-[8px] bg-sunken border border-line ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = isMounted && theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              aria-pressed={isSelected}
              className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-overlay text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-ink-3 hover:text-ink hover:bg-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Icon variant for TopBar
  const isDark = isMounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`btn btn-ghost btn-icon text-ink-3 hover:text-ink ${className}`}
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
