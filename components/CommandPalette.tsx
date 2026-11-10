'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { NavSection } from './Sidebar';
import {
  Search,
  Plus,
  Sparkles,
  ArrowRight,
  Layers,
  Radar,
  FolderGit2,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Link2,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  focusedOpportunity: Opportunity | null;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenAskAI: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onToggleProjectLink: (oppId: string, projectId: string) => void;
  onOpenNewModal: () => void;
  onSelectSection: (section: NavSection) => void;
  onToggleViewMode: () => void;
}

interface CommandItem {
  id: string;
  category: string;
  label: string;
  sublabel?: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  opportunities,
  projects,
  focusedOpportunity,
  onSelectOpportunity,
  onOpenAskAI,
  onAdvanceStatus,
  onToggleProjectLink,
  onOpenNewModal,
  onSelectSection,
  onToggleViewMode,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    if (focusedOpportunity) {
      list.push(
        {
          id: `ctx-ai-${focusedOpportunity.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `Ask AI: ${focusedOpportunity.title}`,
          sublabel: 'Open scoped right drawer',
          shortcut: 'A',
          icon: Sparkles,
          action: () => { onOpenAskAI(focusedOpportunity); onClose(); },
        },
        {
          id: `ctx-adv-${focusedOpportunity.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `Advance Status: ${focusedOpportunity.title}`,
          sublabel: `Current: ${focusedOpportunity.status}`,
          shortcut: 'S',
          icon: ArrowRight,
          action: () => { onAdvanceStatus(focusedOpportunity.id); onClose(); },
        }
      );

      projects.forEach((proj) => {
        const isLinked = focusedOpportunity.projectIds.includes(proj.id);
        list.push({
          id: `ctx-link-${focusedOpportunity.id}-${proj.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `${isLinked ? 'Unlink' : 'Link'} ${proj.title} → ${focusedOpportunity.code}`,
          sublabel: proj.techStack.slice(0, 3).join(', '),
          shortcut: 'P',
          icon: Link2,
          action: () => { onToggleProjectLink(focusedOpportunity.id, proj.id); onClose(); },
        });
      });
    }

    list.push(
      {
        id: 'cmd-new-opp',
        category: 'Actions',
        label: 'New Opportunity Track',
        sublabel: 'Add hackathon, fellowship, ambassador, or waitlist',
        shortcut: 'N',
        icon: Plus,
        action: () => { onClose(); onOpenNewModal(); },
      },
      {
        id: 'nav-today',
        category: 'Navigation',
        label: 'Go to Today Horizon',
        sublabel: '72h hard deadlines and morning digest summary',
        shortcut: '1',
        icon: List,
        action: () => { onSelectSection('today'); onClose(); },
      },
      {
        id: 'nav-pipeline',
        category: 'Navigation',
        label: 'Go to Pipeline',
        sublabel: 'Three operational tiers: Active, Waitlist, Submitted',
        shortcut: '2',
        icon: Layers,
        action: () => { onSelectSection('pipeline'); onClose(); },
      },
      {
        id: 'nav-radar',
        category: 'Navigation',
        label: 'Go to Radar',
        sublabel: 'Daily discovery logs (1A, 1B, 1C, 2)',
        shortcut: '3',
        icon: Radar,
        action: () => { onSelectSection('radar'); onClose(); },
      },
      {
        id: 'nav-arsenal',
        category: 'Navigation',
        label: 'Go to Project Arsenal',
        sublabel: projects.map((p) => p.title).join(', ') || 'Arsenal repositories',
        shortcut: '4',
        icon: FolderGit2,
        action: () => { onSelectSection('arsenal'); onClose(); },
      },
      {
        id: 'nav-settings',
        category: 'Navigation',
        label: 'Go to Settings',
        sublabel: 'Demo mode, BYOK API key, model config',
        icon: SlidersHorizontal,
        action: () => { onSelectSection('settings'); onClose(); },
      }
    );

    opportunities
      .filter((o) => o.status !== 'archived')
      .forEach((opp) => {
        list.push({
          id: `jump-${opp.id}`,
          category: 'Jump to Opportunity',
          label: `${opp.code} · ${opp.title}`,
          sublabel: `${opp.organization} · ${opp.status.toUpperCase()}`,
          icon: List,
          action: () => { onSelectSection('pipeline'); onSelectOpportunity(opp); onClose(); },
        });
      });

    return list;
  }, [focusedOpportunity, opportunities, projects, onAdvanceStatus, onClose, onOpenAskAI, onOpenNewModal, onSelectOpportunity, onSelectSection, onToggleProjectLink]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (item) => item.label.toLowerCase().includes(q) || (item.sublabel && item.sublabel.toLowerCase().includes(q)) || item.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[13vh] px-4 bg-black/35 backdrop-blur-xs select-none" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -6 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          className="w-full max-w-xl rounded-lg bg-white border border-[#E5E5E1] shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Orbit Command Palette"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E5E1] bg-white">
            <Search className="w-4 h-4 text-[#4355B9] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="Type a command, opportunity code, or project name..."
              className="flex-1 bg-transparent text-sm text-[#16181D] placeholder:text-[#6B7280] focus:outline-none"
            />
            <kbd className="font-mono text-[10px] text-[#6B7280] bg-[#F5F5F3] border border-[#E5E5E1] px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-[#E5E5E1]/60">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280] font-mono">No matching commands or opportunities for &ldquo;{query}&rdquo;</div>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded text-left transition-colors ${
                      isSelected ? 'bg-[#4355B9]/10 text-[#16181D]' : 'text-[#6B7280] hover:bg-[#F5F5F3] hover:text-[#16181D]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#4355B9]' : 'text-[#6B7280]'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{item.label}</div>
                        {item.sublabel && <div className="text-[11px] font-mono text-[#6B7280] truncate">{item.category} · {item.sublabel}</div>}
                      </div>
                    </div>
                    {item.shortcut && (
                      <kbd className="font-mono text-[10px] text-[#6B7280] bg-[#F5F5F3] border border-[#E5E5E1] px-1.5 py-0.5 rounded shrink-0">{item.shortcut}</kbd>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-[#F5F5F3] border-t border-[#E5E5E1] flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Execute</span>
              <span>Esc Dismiss</span>
            </div>
            <span>ORBIT COMMAND SYSTEM</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
