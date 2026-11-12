'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { NavSection } from './Sidebar';
import {
  Search, Plus, Sparkles, ArrowRight, Layers, Radar,
  FolderGit2, SlidersHorizontal, List, Link2, Pencil,
} from 'lucide-react';
import { dur, ease } from '@/lib/motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  projects: ArsenalProject[];
  focusedOpportunity: Opportunity | null;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenAskAI: (opp: Opportunity) => void;
  onOpenEdit?: (opp: Opportunity) => void;
  onAdvanceStatus: (id: string) => void;
  onToggleProjectLink: (oppId: string, projectId: string) => void;
  onOpenNewModal: () => void;
  onSelectSection: (section: NavSection) => void;
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
  isOpen, onClose, opportunities, projects, focusedOpportunity,
  onSelectOpportunity, onOpenAskAI, onOpenEdit, onAdvanceStatus,
  onToggleProjectLink, onOpenNewModal, onSelectSection,
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
          id: `ctx-edit-${focusedOpportunity.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `Edit: ${focusedOpportunity.title}`,
          sublabel: 'Title, URL, deadline, notes',
          shortcut: 'E',
          icon: Pencil,
          action: () => { if (onOpenEdit) onOpenEdit(focusedOpportunity); onClose(); },
        },
        {
          id: `ctx-ai-${focusedOpportunity.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `Ask AI: ${focusedOpportunity.title}`,
          sublabel: 'Open scoped assistant',
          shortcut: 'A',
          icon: Sparkles,
          action: () => { onOpenAskAI(focusedOpportunity); onClose(); },
        },
        {
          id: `ctx-adv-${focusedOpportunity.id}`,
          category: `Focused (${focusedOpportunity.code})`,
          label: `Advance status: ${focusedOpportunity.title}`,
          sublabel: `Status: ${focusedOpportunity.status}`,
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
          label: `${isLinked ? 'Unlink' : 'Link'} ${proj.title}`,
          sublabel: proj.techStack.slice(0, 3).join(', '),
          shortcut: 'P',
          icon: Link2,
          action: () => { onToggleProjectLink(focusedOpportunity.id, proj.id); onClose(); },
        });
      });
    }

    list.push(
      { id: 'cmd-new-opp', category: 'Actions', label: 'New track', sublabel: 'Add hackathon, fellowship, or ambassador role', shortcut: 'N', icon: Plus, action: () => { onClose(); onOpenNewModal(); } },
      { id: 'nav-today', category: 'Go to', label: 'Today', sublabel: '72h deadlines and digest', shortcut: '1', icon: List, action: () => { onSelectSection('today'); onClose(); } },
      { id: 'nav-pipeline', category: 'Go to', label: 'Pipeline', sublabel: 'Active, waitlist, and submitted tracks', shortcut: '2', icon: Layers, action: () => { onSelectSection('pipeline'); onClose(); } },
      { id: 'nav-radar', category: 'Go to', label: 'Radar', sublabel: 'Daily morning digest', shortcut: '3', icon: Radar, action: () => { onSelectSection('radar'); onClose(); } },
      { id: 'nav-arsenal', category: 'Go to', label: 'Arsenal', sublabel: projects.map((p) => p.title).join(', ') || 'Projects', shortcut: '4', icon: FolderGit2, action: () => { onSelectSection('arsenal'); onClose(); } },
      { id: 'nav-settings', category: 'Go to', label: 'Settings', sublabel: 'Account sync, BYOK key, JSON backups', icon: SlidersHorizontal, action: () => { onSelectSection('settings'); onClose(); } }
    );

    opportunities.filter((o) => o.status !== 'archived').forEach((opp) => {
      list.push({
        id: `jump-${opp.id}`,
        category: 'Jump to track',
        label: `${opp.code} · ${opp.title}`,
        sublabel: `${opp.organization} · ${opp.status}`,
        icon: List,
        action: () => { onSelectSection('pipeline'); onSelectOpportunity(opp); onClose(); },
      });
    });

    return list;
  }, [focusedOpportunity, opportunities, projects, onAdvanceStatus, onClose, onOpenAskAI, onOpenEdit, onOpenNewModal, onSelectOpportunity, onSelectSection, onToggleProjectLink]);

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
      e.stopPropagation();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 bg-ink/24 select-none" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: dur.fast, ease: ease.out } }}
          exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.1 } }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          className="w-full max-w-[540px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Commands"
        >
          <div className="flex items-center gap-2.5 px-4 h-12 border-b border-line bg-overlay">
            <Search className="w-4 h-4 text-ink-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-ink-4 focus:outline-none"
            />
            <span className="kbd">Esc</span>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-ink-3">No matching commands for &ldquo;{query}&rdquo;</div>
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
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-[8px] text-left transition-colors ${
                      isSelected ? 'bg-pressed text-ink' : 'text-ink-2 hover:bg-hover hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-ink-3" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">{item.label}</div>
                        {item.sublabel && <div className="text-[12px] text-ink-3 truncate">{item.sublabel}</div>}
                      </div>
                    </div>
                    {item.shortcut && <span className="kbd">{item.shortcut}</span>}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-raised border-t border-line flex items-center justify-between text-[11px] font-mono text-ink-3">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Run</span>
              <span>Esc Close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
