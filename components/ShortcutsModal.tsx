'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'N', desc: 'Create new opportunity track' },
  { key: 'J / K', desc: 'Navigate between opportunities' },
  { key: 'Enter / Space', desc: 'Expand or collapse sub-tasks' },
  { key: 'E', desc: 'Edit focused opportunity details' },
  { key: 'A', desc: 'Open Ask AI drawer' },
  { key: 'S', desc: 'Advance status (Active → Submitted)' },
  { key: 'P', desc: 'Link Arsenal project to focused item' },
  { key: '⌘K / Ctrl+K', desc: 'Open Command Palette' },
  { key: '1, 2, 3, 4', desc: 'Switch sections (Today, Pipeline, Radar, Arsenal)' },
  { key: 'Esc', desc: 'Close open modal, drawer, or palette' },
  { key: '?', desc: 'Show this keyboard guide' },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/24 select-none"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className="h-14 px-6 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-ink-3" />
            <h2 className="text-[15px] font-semibold text-ink">
              Keyboard shortcuts
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 divide-y divide-line-faint max-h-[70vh] overflow-y-auto text-[13px]">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2.5 gap-3"
            >
              <span className="text-ink-2">{s.desc}</span>
              <span className="kbd shrink-0">{s.key}</span>
            </div>
          ))}
        </div>

        <div className="h-12 px-6 bg-raised border-t border-line flex items-center justify-between text-[11px] font-mono text-ink-3">
          <span>ORBIT KEYMAP</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
