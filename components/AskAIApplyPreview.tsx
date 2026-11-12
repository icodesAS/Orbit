'use client';

import React, { useState } from 'react';
import { X, Check, ListTodo, FileText } from 'lucide-react';
import { SubTask } from '@/lib/types';
import { generateId } from '@/lib/id';

interface AskAIApplyPreviewProps {
  type: 'tasks' | 'copy';
  rawText: string;
  existingCopy?: string | null;
  onApplyTasks: (newTasks: SubTask[]) => void;
  onApplyCopy: (updatedCopy: string) => void;
  onClose: () => void;
}

function parseChecklistItems(text: string): string[] {
  const lines = text.split('\n');
  const items: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^[-*]\s*\[[ x]?\]\s*(.+)$/i) || trimmed.match(/^[-*]\s*(.+)$/);
    if (match && match[1]) {
      const clean = match[1].replace(/^\*\*|\*\*$/g, '').trim();
      if (clean.length > 2 && clean.length < 200 && !clean.toLowerCase().startsWith('note:')) {
        items.push(clean);
      }
    }
  }
  return items;
}

export default function AskAIApplyPreview({
  type,
  rawText,
  existingCopy,
  onApplyTasks,
  onApplyCopy,
  onClose,
}: AskAIApplyPreviewProps) {
  const [parsedTasks, setParsedTasks] = useState<Array<{ title: string; selected: boolean }>>(() => {
    if (type !== 'tasks') return [];
    const items = parseChecklistItems(rawText);
    return items.map((title) => ({ title, selected: true }));
  });

  const [copyMode, setCopyMode] = useState<'replace' | 'append'>('replace');
  const [editedCopy, setEditedCopy] = useState(() => rawText.trim());

  const handleToggleTask = (idx: number) => {
    setParsedTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleConfirmTasks = () => {
    const selected = parsedTasks.filter((t) => t.selected && t.title.trim());
    if (selected.length === 0) return;
    const now = new Date().toISOString();
    const newSubTasks: SubTask[] = selected.map((t, i) => ({
      id: generateId('task'),
      title: t.title.trim(),
      done: false,
      sortOrder: i,
      createdAt: now,
    }));
    onApplyTasks(newSubTasks);
    onClose();
  };

  const handleConfirmCopy = () => {
    let finalCopy = editedCopy.trim();
    if (copyMode === 'append' && existingCopy && existingCopy.trim()) {
      finalCopy = `${existingCopy.trim()}\n\n---\n\n${finalCopy}`;
    }
    onApplyCopy(finalCopy);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-[10px] bg-white border border-line p-3 shadow-md text-xs space-y-2.5 my-2"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-line">
        <div className="flex items-center gap-1.5 font-medium text-ink">
          {type === 'tasks' ? (
            <>
              <ListTodo className="w-3.5 h-3.5 text-ink-2" />
              <span>Apply Milestones to Checklist</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5 text-ink-2" />
              <span>Apply to Application Copy</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-3 hover:text-ink p-1 rounded transition-colors"
          aria-label="Close preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {type === 'tasks' ? (
        <div className="space-y-2">
          {parsedTasks.length === 0 ? (
            <div className="text-ink-3 py-2 text-center text-[11.5px]">
              No checklist lines detected. Ensure prompt uses &quot;- [ ] task&quot; format.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {parsedTasks.map((t, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2 p-1.5 rounded hover:bg-hover cursor-pointer text-ink text-[12px]"
                >
                  <input
                    type="checkbox"
                    checked={t.selected}
                    onChange={() => handleToggleTask(idx)}
                    className="mt-0.5 rounded border-line text-ink accent-ink"
                  />
                  <span className={t.selected ? 'text-ink' : 'text-ink-3 line-through'}>
                    {t.title}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-line">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedTasks.filter((t) => t.selected).length === 0}
              onClick={handleConfirmTasks}
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Add to Checklist ({parsedTasks.filter((t) => t.selected).length})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
            <button
              type="button"
              onClick={() => setCopyMode('replace')}
              className={`px-2 py-0.5 rounded border ${copyMode === 'replace' ? 'border-line font-medium text-ink bg-active' : 'border-transparent'}`}
            >
              Replace existing
            </button>
            <button
              type="button"
              onClick={() => setCopyMode('append')}
              className={`px-2 py-0.5 rounded border ${copyMode === 'append' ? 'border-line font-medium text-ink bg-active' : 'border-transparent'}`}
            >
              Append to existing
            </button>
          </div>

          <textarea
            value={editedCopy}
            onChange={(e) => setEditedCopy(e.target.value)}
            rows={4}
            className="w-full rounded-[6px] border border-line bg-surface p-2 text-[12px] font-sans text-ink focus:outline-none focus:border-ink-2 resize-y"
          />

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-line">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!editedCopy.trim()}
              onClick={handleConfirmCopy}
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Apply to Copy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
