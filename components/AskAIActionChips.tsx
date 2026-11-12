'use client';

import React from 'react';
import { ASK_ACTION_CHIPS, AskActionChip } from '@/prompts';
import { Sparkles, Layers, ShieldCheck, ListOrdered, FileEdit } from 'lucide-react';

interface AskAIActionChipsProps {
  onSelectChip: (prompt: string) => void;
  disabled?: boolean;
  hasLinkedProjects: boolean;
}

const CHIP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ideate: Sparkles,
  fit_check: Layers,
  rubric_gap: ShieldCheck,
  milestones: ListOrdered,
  pitch_draft: FileEdit,
};

export default function AskAIActionChips({
  onSelectChip,
  disabled = false,
  hasLinkedProjects,
}: AskAIActionChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
      {ASK_ACTION_CHIPS.map((chip: AskActionChip) => {
        const Icon = CHIP_ICONS[chip.id] || Sparkles;
        const isFitCheck = chip.id === 'fit_check';
        const isDimmed = isFitCheck && !hasLinkedProjects;

        return (
          <button
            key={chip.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectChip(chip.prompt)}
            title={isDimmed ? 'Requires a linked Arsenal project' : chip.description}
            className={`btn btn-secondary btn-sm shrink-0 text-[11.5px] py-1 px-2.5 font-normal h-7 flex items-center gap-1.5 transition-colors ${
              isDimmed ? 'opacity-50 hover:opacity-100' : ''
            }`}
          >
            <Icon className="w-3 h-3 text-ink-3 shrink-0" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
