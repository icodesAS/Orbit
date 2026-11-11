'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject } from '@/lib/types';
import { X, Calendar, FolderGit2, ArrowUpRight } from 'lucide-react';

interface TrackRadarItemModalProps {
  isOpen: boolean;
  item: RadarItem | null;
  allProjects: ArsenalProject[];
  onClose: () => void;
  onConfirmTrack: (item: RadarItem, confirmedDeadlineIso: string | null, projectId: string | null) => void;
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
  item: RadarItem;
  allProjects: ArsenalProject[];
  onClose: () => void;
  onConfirmTrack: (item: RadarItem, confirmedDeadlineIso: string | null, projectId: string | null) => void;
}

function TrackForm({ item, allProjects, onClose, onConfirmTrack }: FormProps) {
  const [deadline, setDeadline] = useState(() => toLocalDatetimeInputString(item.deadline));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    item.recommendedProjectId || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let confirmedIso = item.deadline;
    if (deadline) {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) {
        confirmedIso = parsed.toISOString();
      }
    }
    onConfirmTrack(item, confirmedIso, selectedProjectId || null);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md rounded-lg bg-white border border-[#E5E5E1] shadow-xl overflow-hidden text-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Track Deadline"
    >
      <div className="px-5 py-3.5 border-b border-[#E5E5E1] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#4355B9]/10 text-[#4355B9] font-medium border border-[#4355B9]/20">
            {item.priority}
          </span>
          <h2 className="text-sm font-semibold text-[#16181D]">
            Track Opportunity
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

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-1">
          <span className="font-mono text-[11px] text-[#6B7280]">
            {item.organization}
          </span>
          <h3 className="font-medium text-[#16181D] text-sm leading-snug">
            {item.title}
          </h3>
          <p className="text-[#6B7280] text-[11px] line-clamp-2 mt-1">
            {item.summary}
          </p>
        </div>

        <div>
          <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Confirm Deadline (Local Time) *</span>
          </label>
          <input
            type="datetime-local"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] font-mono focus:outline-none"
          />
          <span className="text-[10px] text-[#6B7280] mt-1 block">
            Review the source portal deadline before promoting into your pipeline.
          </span>
        </div>

        <div>
          <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Link Arsenal Project (Optional)</span>
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-2.5 py-1.5 text-[#16181D] font-mono focus:outline-none"
          >
            <option value="">None (Fresh track)</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#E5E5E1]">
          <span className="text-[11px] font-mono text-[#6B7280]">
            Esc to cancel
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
              className="px-4 py-1.5 rounded-md bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Confirm & Track</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function TrackRadarItemModal({
  isOpen,
  item,
  allProjects,
  onClose,
  onConfirmTrack,
}: TrackRadarItemModalProps) {
  if (!isOpen || !item) return null;

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
      <TrackForm
        key={item.id}
        item={item}
        allProjects={allProjects}
        onClose={onClose}
        onConfirmTrack={onConfirmTrack}
      />
    </div>
  );
}
