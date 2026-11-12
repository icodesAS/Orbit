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
import { motion } from 'motion/react';
import { NavSection } from './MobileNavBar';
import { OrbitGlyph } from './OrbitGlyph';
import { spring } from '@/lib/motion';

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
  userName?: string | null;
  onOpenCommandPalette: () => void;
  onOpenNewModal: () => void;
  onOpenShortcutsModal: () => void;
}

export default function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  isSignedIn = false,
  userName,
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

  const displayName = isSignedIn ? userName || 'Account' : 'Guest';
  const initial = (displayName[0] || 'G').toUpperCase();

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen bg-sidebar border-r border-line select-none shrink-0 z-30 transition-[width] duration-150 ease-out ${
        isCollapsed ? 'w-14' : 'w-[256px]'
      }`}
      aria-label="Primary Navigation"
    >
      <div className="flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-3.5 border-b border-line gap-2">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <OrbitGlyph size="sm" className="text-ink" />
            {!isCollapsed && (
              <span className="font-semibold text-[14px] tracking-[-0.01em] text-ink truncate">
                Orbit
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="btn btn-ghost btn-icon shrink-0"
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

        {/* New Track Button */}
        <div className="p-2.5 border-b border-line">
          <button
            type="button"
            onClick={onOpenNewModal}
            title="New track (N)"
            className={`btn btn-secondary w-full ${
              isCollapsed ? '!px-0 justify-center' : 'justify-between'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Plus className="w-3.5 h-3.5 text-ink-3 shrink-0" />
              {!isCollapsed && <span className="truncate">New track</span>}
            </span>
            {!isCollapsed && <span className="kbd">N</span>}
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
                className={`relative w-full h-8 flex items-center rounded-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                } ${
                  isActive
                    ? 'text-ink font-medium'
                    : 'text-ink-2 hover:text-ink hover:bg-hover'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={spring.snappy}
                    className="absolute inset-0 rounded-[8px] bg-pressed -z-10"
                  />
                )}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-ink' : 'text-ink-3'
                    }`}
                  />
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

      {/* Footer: Settings + User Chip */}
      <div className="p-2 border-t border-line space-y-1">
        <button
          type="button"
          onClick={() => onSelectSection('settings')}
          title="Settings"
          className={`relative w-full h-8 flex items-center rounded-[8px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
            isCollapsed ? 'justify-center px-0' : 'px-2.5'
          } ${
            activeSection === 'settings'
              ? 'text-ink font-medium'
              : 'text-ink-2 hover:text-ink hover:bg-hover'
          }`}
        >
          {activeSection === 'settings' && (
            <motion.span
              layoutId="nav-active"
              transition={spring.snappy}
              className="absolute inset-0 rounded-[8px] bg-pressed -z-10"
            />
          )}
          <div className="flex items-center gap-2.5 min-w-0">
            <SlidersHorizontal
              className={`w-4 h-4 shrink-0 ${
                activeSection === 'settings' ? 'text-ink' : 'text-ink-3'
              }`}
            />
            {!isCollapsed && <span className="text-[13px] truncate">Settings</span>}
          </div>
        </button>

        {!isCollapsed && (
          <div className="px-2.5 py-1.5 flex items-center justify-between gap-2 rounded-[8px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded-full bg-sunken border border-line font-mono text-[10px] font-medium text-ink-2 flex items-center justify-center shrink-0">
                {initial}
              </span>
              <span className="text-[12.5px] text-ink-2 truncate font-medium">
                {displayName}
              </span>
            </div>
            <span className="font-mono text-[11px] text-ink-3 shrink-0">
              {isSignedIn ? 'Synced' : 'Local only'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
