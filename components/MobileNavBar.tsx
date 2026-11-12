'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Radar,
  FolderGit2,
  MoreVertical,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export type NavSection = 'today' | 'pipeline' | 'radar' | 'arsenal' | 'settings';

interface MobileNavBarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    urgent72h: number;
    pipeline: number;
    radarUnreviewed: number;
    arsenal: number;
  };
}

export default function MobileNavBar({
  activeSection,
  onSelectSection,
  counts,
}: MobileNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'today', label: 'Today', icon: Calendar, count: counts.urgent72h },
    { id: 'pipeline', label: 'Pipeline', icon: Layers, count: counts.pipeline },
    { id: 'radar', label: 'Radar', icon: Radar, count: counts.radarUnreviewed },
    { id: 'arsenal', label: 'Arsenal', icon: FolderGit2, count: counts.arsenal },
  ];

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="absolute bottom-14 right-3 w-48 bg-overlay border border-line rounded-[12px] shadow-[var(--shadow-pop)] p-1.5 space-y-1 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-1 border-b border-line text-[11px] font-mono uppercase tracking-[0.06em] text-ink-3">
              <span>Menu</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-ink-3 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectSection('settings');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-left text-ink hover:bg-hover font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink-3" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-13 bg-sidebar border-t border-line flex items-center justify-around px-2 z-30 select-none"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectSection(tab.id);
                setIsMenuOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-[8px] transition-colors relative ${
                isActive
                  ? 'text-ink font-medium bg-pressed'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5 shrink-0" />
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-primary text-primary-fg text-[9px] font-mono flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-[8px] transition-colors ${
            activeSection === 'settings' || isMenuOpen
              ? 'text-ink font-medium bg-pressed'
              : 'text-ink-3 hover:text-ink'
          }`}
          title="More options"
        >
          <MoreVertical className="w-4 h-4 mb-0.5 shrink-0" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </>
  );
}
