'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject } from '@/lib/types';
import { X, ArrowUpRight } from 'lucide-react';
import { DeadlinePicker } from '@/components/DeadlinePicker';
import { parseValue, toLocalPickerValue } from '@/lib/deadline-picker-utils';

export interface TrackRadarItemFormProps {
  item: RadarItem;
  allProjects: ArsenalProject[];
  onClose: () => void;
  onConfirmTrack: (
    item: RadarItem,
    confirmedDeadlineIso: string | null,
    projectId: string | null
  ) => void;
}

export default function TrackRadarItemForm({
  item,
  allProjects,
  onClose,
  onConfirmTrack,
}: TrackRadarItemFormProps) {
  const [deadline, setDeadline] = useState<string | null>(() =>
    toLocalPickerValue(item.deadline)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    item.recommendedProjectId || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDeadline = parseValue(deadline);
    const confirmedIso = parsedDeadline ? parsedDeadline.toISOString() : null;
    onConfirmTrack(item, confirmedIso, selectedProjectId || null);
    onClose();
  };

  let domain = item.organization;
  try {
    if (item.url) domain = new URL(item.url).hostname.replace(/^www\./, '');
  } catch {
    // fallback to organization
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-[520px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] flex flex-col max-h-[calc(100vh-64px)]"
      role="dialog"
      aria-modal="true"
      aria-label="Track radar item"
    >
      <div className="h-14 px-6 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="chip">{item.priority}</span>
          <h2 className="text-[15px] font-semibold text-ink">Track item</h2>
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

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Read-only context strip on --raised */}
          <div className="rounded-[8px] bg-raised border border-line px-3 py-2.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-ink-3">{item.organization}</span>
              <span className="font-mono text-[11px] text-ink-3">{domain}</span>
            </div>
            <h3 className="text-[14px] font-medium text-ink leading-snug">{item.title}</h3>
            {item.summary && (
              <p className="text-[12.5px] text-ink-2 leading-relaxed line-clamp-2">
                {item.summary}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="track-radar-deadline" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
              Confirm deadline (local)
            </label>
            <DeadlinePicker
              id="track-radar-deadline"
              value={deadline}
              onChange={setDeadline}
            />
            <span className="text-[11.5px] text-ink-3 mt-1.5 block">
              Confirm or adjust the deadline before promoting into your pipeline.
            </span>
          </div>

          <div>
            <label htmlFor="track-radar-project" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
              Link Arsenal project (optional)
            </label>
            <select
              id="track-radar-project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="input"
            >
              <option value="">None (Fresh track)</option>
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-14 px-6 bg-raised border-t border-line flex items-center justify-between shrink-0 rounded-b-[16px]">
          <span className="font-mono text-[11px] text-ink-3">Esc to cancel</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <span>Track item</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
