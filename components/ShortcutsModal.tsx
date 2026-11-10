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
  { key: 'A', desc: 'Open Scoped Ask AI drawer' },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white border border-[#E5E5E1] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Orbit Keyboard Shortcuts"
      >
        <div className="px-5 py-3.5 border-b border-[#E5E5E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#4355B9]" />
            <h2 className="text-sm font-semibold text-[#16181D]">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#16181D] p-1 rounded font-mono text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 divide-y divide-[#E5E5E1] max-h-[70vh] overflow-y-auto text-xs">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between py-1.5 ${
                idx === 0 ? '' : 'pt-2'
              }`}
            >
              <span className="text-[#16181D]">{s.desc}</span>
              <kbd className="font-mono text-[11px] text-[#16181D] bg-[#F5F5F3] border border-[#E5E5E1] px-2 py-0.5 rounded shadow-2xs shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-2.5 bg-[#F5F5F3] border-t border-[#E5E5E1] flex items-center justify-between text-[11px] font-mono text-[#6B7280]">
          <span>ORBIT KEYMAP</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
