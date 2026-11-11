'use client';

import React, { useState } from 'react';
import { Opportunity } from '@/lib/types';
import { X, Calendar, Globe, FileText, AlignLeft } from 'lucide-react';

interface EditOpportunityModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (updated: Opportunity) => void;
}

function toLocalDatetimeInputString(isoDate: string | null): string {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

interface FormProps {
  opportunity: Opportunity;
  onClose: () => void;
  onSave: (updated: Opportunity) => void;
}

function EditOpportunityForm({ opportunity, onClose, onSave }: FormProps) {
  const [title, setTitle] = useState(opportunity.title);
  const [url, setUrl] = useState(opportunity.url || '');
  const [deadline, setDeadline] = useState(() => toLocalDatetimeInputString(opportunity.deadline));
  const [notes, setNotes] = useState(opportunity.notes || '');
  const [applicationCopy, setApplicationCopy] = useState(opportunity.applicationCopy || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let deadlineIso = opportunity.deadline;
    if (deadline) {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) {
        deadlineIso = parsed.toISOString();
      }
    }

    onSave({
      ...opportunity,
      title: title.trim(),
      url: url.trim() || null,
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
      className="w-full max-w-lg rounded-lg bg-white border border-[#E5E5E1] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Opportunity"
    >
      <div className="px-5 py-3.5 border-b border-[#E5E5E1] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#4355B9] font-medium">
            {opportunity.code}
          </span>
          <h2 className="text-sm font-semibold text-[#16181D]">
            Edit Opportunity
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#16181D] p-1 rounded hover:bg-[#F5F5F3] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
        <div>
          <label className="block text-[#16181D] font-medium mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-md px-3 py-2 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Deadline (Local Time) *</span>
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-md px-2.5 py-1.5 text-[#16181D] font-mono text-xs focus:bg-white focus:border-[#4355B9] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Source / Portal URL</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-md px-2.5 py-1.5 text-[#16181D] font-mono text-xs focus:bg-white focus:border-[#4355B9] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Application Copy / Pitch</span>
          </label>
          <textarea
            rows={3}
            value={applicationCopy}
            onChange={(e) => setApplicationCopy(e.target.value)}
            placeholder="30-second context blurb or technical submission pitch..."
            className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-md px-3 py-2 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none text-xs leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Personal Notes & Next Steps</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private requirements, eligibility caveats, reviewer notes..."
            className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded-md px-3 py-2 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none text-xs leading-relaxed"
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#E5E5E1]">
          <span className="text-[11px] font-mono text-[#6B7280]">
            Press Esc to cancel
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[#E5E5E1] bg-white text-[#16181D] hover:bg-[#F5F5F3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium transition-colors shadow-2xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditOpportunityModal({
  isOpen,
  opportunity,
  onClose,
  onSave,
}: EditOpportunityModalProps) {
  if (!isOpen || !opportunity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <EditOpportunityForm
        key={opportunity.id}
        opportunity={opportunity}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
