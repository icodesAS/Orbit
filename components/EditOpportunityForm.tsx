'use client';

import React, { useState } from 'react';
import { Opportunity } from '@/lib/types';
import { computeUrlHash } from '@/lib/hash';
import { X } from 'lucide-react';
import { DeadlinePicker } from '@/components/DeadlinePicker';
import { parseValue, toLocalPickerValue } from '@/lib/deadline-picker-utils';

export interface EditOpportunityFormProps {
  opportunity: Opportunity;
  onClose: () => void;
  onSave: (updated: Opportunity) => void;
}

export default function EditOpportunityForm({ opportunity, onClose, onSave }: EditOpportunityFormProps) {
  const [title, setTitle] = useState(opportunity.title);
  const [url, setUrl] = useState(opportunity.url || '');
  const [deadline, setDeadline] = useState<string | null>(() =>
    toLocalPickerValue(opportunity.deadline)
  );
  const [notes, setNotes] = useState(opportunity.notes || '');
  const [applicationCopy, setApplicationCopy] = useState(
    opportunity.applicationCopy || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedDeadline = parseValue(deadline);
    const deadlineIso = parsedDeadline ? parsedDeadline.toISOString() : null;
    const trimmedUrl = url.trim();

    onSave({
      ...opportunity,
      title: title.trim(),
      url: trimmedUrl || null,
      urlHash: trimmedUrl ? computeUrlHash(trimmedUrl) : '',
      deadline: deadlineIso,
      notes: notes.trim() || null,
      applicationCopy: applicationCopy.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-[520px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] flex flex-col max-h-[calc(100vh-64px)]"
      role="dialog"
      aria-modal="true"
      aria-label="Edit track"
    >
      <div className="h-14 px-6 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="chip">{opportunity.code}</span>
          <h2 className="text-[15px] font-semibold text-ink">Edit track</h2>
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
          <div>
            <label htmlFor="edit-track-title" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
              Title <span className="text-ink-3">*</span>
            </label>
            <input
              id="edit-track-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="edit-track-deadline" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Deadline (local)
              </label>
              <DeadlinePicker
                id="edit-track-deadline"
                value={deadline}
                onChange={setDeadline}
              />
            </div>

            <div>
              <label htmlFor="edit-track-url" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Source / Portal URL
              </label>
              <input
                id="edit-track-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="input font-mono text-[13px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-track-copy" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
              Application copy / pitch
            </label>
            <textarea
              id="edit-track-copy"
              rows={3}
              value={applicationCopy}
              onChange={(e) => setApplicationCopy(e.target.value)}
              placeholder="30-second context blurb or technical submission pitch..."
              className="input !h-auto py-2 leading-relaxed"
            />
          </div>

          <div>
            <label htmlFor="edit-track-notes" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
              Personal notes & next steps
            </label>
            <textarea
              id="edit-track-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private requirements, eligibility caveats, reviewer notes..."
              className="input !h-auto py-2 leading-relaxed"
            />
          </div>
        </div>

        <div className="h-14 px-6 bg-raised border-t border-line flex items-center justify-between shrink-0 rounded-b-[16px]">
          <span className="font-mono text-[11px] text-ink-3">Esc to cancel</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn btn-primary"
            >
              <span>Save changes</span>
              <span className="kbd">⌘↵</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
