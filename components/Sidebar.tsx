'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Radar,
  FolderGit2,
  SlidersHorizontal,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavSection } from './MobileNavBar';

export type { NavSection };

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    urgent72h: number;
    pipeline: number;
    radarUnreviewed: number;
    arsenal: number;
  };
  isSignedIn?: boolean;
  onOpenCommandPalette: () => void;
  onOpenNewModal: () => void;
  onOpenShortcutsModal: () => void;
}

export default function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  isSignedIn = false,
  onOpenNewModal,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: {
    id: NavSection;
    label: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      id: 'today',
      label: 'Today',
      shortcut: '1',
      icon: Calendar,
      count: counts.urgent72h,
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      shortcut: '2',
      icon: Layers,
      count: counts.pipeline,
    },
    {
      id: 'radar',
      label: 'Radar',
      shortcut: '3',
      icon: Radar,
      count: counts.radarUnreviewed,
    },
    {
      id: 'arsenal',
      label: 'Arsenal',
      shortcut: '4',
      icon: FolderGit2,
      count: counts.arsenal,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen bg-canvas-sunken border-r border-line select-none shrink-0 z-30 transition-[width] duration-120 ease-out ${
        isCollapsed ? 'w-14' : 'w-[220px]'
      }`}
      aria-label="Primary Navigation"
    >
      <div className="flex flex-col min-w-0">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-11 flex items-center justify-between px-3.5 border-b border-line gap-2">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="font-semibold text-[13px] tracking-tight text-ink">
              Orbit
            </span>
            {!isCollapsed && isSignedIn && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-success shrink-0"
                title="Synced with cloud"
                aria-label="Synced with cloud"
              />
            )}
            {!isCollapsed && !isSignedIn && (
              <span className="font-mono text-[10px] text-ink-3">
                guest
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 rounded text-ink-3 hover:text-ink hover:bg-hover transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* New Opportunity Track CTA */}
        <div className="p-2 border-b border-line">
          <button
            type="button"
            onClick={onOpenNewModal}
            title="New track (N)"
            className={`w-full h-[30px] flex items-center rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
              isCollapsed ? 'justify-center px-0' : 'px-2.5 justify-between'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Plus className="w-3.5 h-3.5 text-ink-3 shrink-0" />
              {!isCollapsed && <span className="truncate">New track</span>}
            </span>
            {!isCollapsed && (
              <span className="font-mono text-[11px] text-ink-3">
                N
              </span>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                title={`${item.label} (${item.shortcut})`}
                className={`w-full h-[30px] flex items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  isCollapsed ? 'justify-center px-0' : 'justify-between px-2'
                } ${
                  isActive
                    ? 'bg-selected text-ink font-medium'
                    : 'text-ink-2 hover:text-ink hover:bg-hover'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-ink-3" />
                  {!isCollapsed && (
                    <span className="text-[13px] truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && typeof item.count === 'number' && item.count > 0 && (
                  <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings Single Row */}
      <div className="p-2 border-t border-line">
        <button
          type="button"
          onClick={() => onSelectSection('settings')}
          title="Settings"
          className={`w-full h-[30px] flex items-center rounded-md transition-colors text-ink-2 hover:text-ink hover:bg-hover ${
            isCollapsed ? 'justify-center px-0' : 'px-2'
          } ${activeSection === 'settings' ? 'bg-selected text-ink font-medium' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 shrink-0 text-ink-3" />
            {!isCollapsed && <span className="text-[13px] truncate">Settings</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
