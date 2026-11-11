'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Radar,
  FolderGit2,
  SlidersHorizontal,
  Command,
  Plus,
  Keyboard,
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
  onOpenCommandPalette,
  onOpenNewModal,
  onOpenShortcutsModal,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

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
      className={`hidden md:flex flex-col justify-between h-screen bg-white border-r border-[#E5E5E1] select-none shrink-0 z-30 transition-[width] duration-150 ease-out ${
        isCollapsed ? 'w-14' : 'w-[220px]'
      }`}
      aria-label="Primary Navigation"
    >
      <div className="flex flex-col min-w-0">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="h-12 flex items-center justify-between px-3.5 border-b border-[#E5E5E1] gap-2">
          <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
            <div className="w-6 h-6 rounded bg-[#4355B9]/10 border border-[#4355B9]/20 flex items-center justify-center shrink-0 text-[#4355B9] font-mono font-bold text-[11px]">
              OR
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm tracking-tight text-[#16181D]">
                  Orbit
                </span>
                <span
                  className={`font-mono text-[9px] px-1 py-0.2 rounded border uppercase font-medium ${
                    isSignedIn
                      ? 'text-[#067647] bg-[#ECFDF3] border-[#D1FADF]'
                      : 'text-[#6B7280] bg-[#F5F5F3] border-[#E5E5E1]'
                  }`}
                >
                  {isSignedIn ? 'SYNCED' : 'GUEST'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1 rounded text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* New Opportunity Track CTA */}
        <div className="p-2 border-b border-[#E5E5E1]/70">
          <button
            type="button"
            onClick={onOpenNewModal}
            title="New Opportunity (N)"
            className={`w-full h-8 flex items-center gap-2.5 rounded-lg border border-[#E5E5E1] bg-[#F5F5F3] hover:bg-white text-[#16181D] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4355B9] ${
              isCollapsed ? 'justify-center px-0' : 'px-2.5 justify-between'
            }`}
          >
            <span className="flex items-center gap-2 truncate">
              <Plus className="w-3.5 h-3.5 text-[#4355B9] shrink-0" />
              {!isCollapsed && (
                <span className="text-xs font-medium truncate">New Track</span>
              )}
            </span>
            {!isCollapsed && (
              <kbd className="font-mono text-[10px] text-[#6B7280] bg-white border border-[#E5E5E1] px-1 py-0.2 rounded shadow-2xs">
                N
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                title={`${item.label} (${item.shortcut})`}
                className={`w-full h-8.5 flex items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4355B9] ${
                  isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                } ${
                  isActive
                    ? 'bg-[#4355B9]/10 text-[#4355B9] font-medium'
                    : 'text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-[#4355B9]/15 text-[#4355B9]'
                            : 'bg-[#F5F5F3] text-[#6B7280]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    <kbd className="font-mono text-[10px] text-[#6B7280]/60">
                      {item.shortcut}
                    </kbd>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings Menu */}
      <div className="p-2 border-t border-[#E5E5E1] space-y-1 relative">
        {/* Settings Popover */}
        {isSettingsMenuOpen && (
          <div
            className="absolute bottom-11 left-2 w-48 bg-white border border-[#E5E5E1] rounded-lg shadow-md p-1 space-y-0.5 text-xs z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                onSelectSection('settings');
                setIsSettingsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-[#16181D] hover:bg-[#F5F5F3] font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Workspace Settings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenShortcutsModal();
                setIsSettingsMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3]"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Shortcuts Map (?)</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsSettingsMenuOpen((prev) => !prev)}
          title="Settings & Menu"
          className={`w-full h-8 flex items-center rounded-lg transition-colors text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
          } ${activeSection === 'settings' ? 'bg-[#4355B9]/10 text-[#4355B9]' : ''}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">Settings</span>}
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Command Palette (⌘K)"
          className={`w-full h-8 flex items-center rounded-lg transition-colors text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Command className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-xs truncate">Commands</span>}
          </div>
          {!isCollapsed && (
            <kbd className="font-mono text-[10px] text-[#6B7280]">⌘K</kbd>
          )}
        </button>
      </div>
    </aside>
  );
}
