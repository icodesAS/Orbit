'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Layers,
  Radar,
  FolderGit2,
  SlidersHorizontal,
  Command,
  Plus,
  Keyboard,
} from 'lucide-react';

export type NavSection = 'pipeline' | 'radar' | 'arsenal' | 'settings';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    pipeline: number;
    radarUnreviewed: number;
    arsenal: number;
    urgent72h: number;
  };
  isLive?: boolean;
  onOpenCommandPalette: () => void;
  onOpenNewModal: () => void;
  onOpenShortcutsModal: () => void;
}

export default function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  isLive = false,
  onOpenCommandPalette,
  onOpenNewModal,
  onOpenShortcutsModal,
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const navItems: {
    id: NavSection;
    label: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    {
      id: 'pipeline',
      label: 'Pipeline',
      shortcut: '1',
      icon: Layers,
      count: counts.pipeline,
    },
    {
      id: 'radar',
      label: 'Radar',
      shortcut: '2',
      icon: Radar,
      count: counts.radarUnreviewed,
    },
    {
      id: 'arsenal',
      label: 'Arsenal',
      shortcut: '3',
      icon: FolderGit2,
      count: counts.arsenal,
    },
    {
      id: 'settings',
      label: 'Settings',
      shortcut: '4',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered ? 212 : 56 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
        }
        className="hidden md:flex flex-col justify-between h-screen bg-[#0c0c0e] border-r border-zinc-800/80 select-none shrink-0 z-30 overflow-hidden"
        aria-label="Primary Navigation"
      >
        <div className="flex flex-col">
          <div className="h-12 flex items-center px-3.5 border-b border-zinc-800/80 gap-3">
            <div className="w-7 h-7 rounded bg-blue-600/15 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400 font-mono font-bold text-xs tracking-tighter">
              OR
            </div>
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.14 }}
              className="flex items-center justify-between flex-1 min-w-0 overflow-hidden whitespace-nowrap"
            >
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                Orbit
              </span>
              <span
                className={`font-mono text-[10px] tabular-nums px-1.5 py-0.2 rounded border ${
                  isLive
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}
              >
                {isLive ? 'LIVE' : 'DEMO'}
              </span>
            </motion.div>
          </div>

          <div className="p-2 border-b border-zinc-800/60">
            <button
              type="button"
              onClick={onOpenNewModal}
              title="New Opportunity (N)"
              className="w-full h-8 flex items-center gap-3 px-2.5 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4 text-blue-400 shrink-0" />
              <motion.div
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-between flex-1 min-w-0 whitespace-nowrap overflow-hidden"
              >
                <span className="text-xs font-medium text-zinc-200">
                  New Track
                </span>
                <kbd className="font-mono text-[10px] text-zinc-500">N</kbd>
              </motion.div>
            </button>
          </div>

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
                  className={`w-full h-9 flex items-center gap-3 px-2.5 rounded transition-colors relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-500/12 text-blue-400 border border-blue-500/25'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <motion.div
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center justify-between flex-1 min-w-0 whitespace-nowrap overflow-hidden"
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {typeof item.count === 'number' && (
                        <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                          {item.count}
                        </span>
                      )}
                      <kbd className="font-mono text-[10px] text-zinc-600">
                        {item.shortcut}
                      </kbd>
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-2 border-t border-zinc-800/80 space-y-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title="Command Palette (⌘K)"
            className="w-full h-8 flex items-center gap-3 px-2.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <Command className="w-4 h-4 shrink-0 text-zinc-400" />
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-between flex-1 min-w-0 whitespace-nowrap overflow-hidden"
            >
              <span className="text-xs">Commands</span>
              <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
            </motion.div>
          </button>

          <button
            type="button"
            onClick={onOpenShortcutsModal}
            title="Keyboard Shortcuts (?)"
            className="w-full h-8 flex items-center gap-3 px-2.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <Keyboard className="w-4 h-4 shrink-0 text-zinc-500" />
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center justify-between flex-1 min-w-0 whitespace-nowrap overflow-hidden"
            >
              <span className="text-xs">Keymap</span>
              <kbd className="font-mono text-[10px] text-zinc-500">?</kbd>
            </motion.div>
          </button>
        </div>
      </motion.aside>

      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-13 bg-[#0c0c0e]/95 backdrop-blur border-t border-zinc-800/90 flex items-center justify-around px-2 z-30"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded text-xs transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
