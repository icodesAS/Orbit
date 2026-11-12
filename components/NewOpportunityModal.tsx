'use client';

import React, { useState } from 'react';
import {
  Opportunity,
  OpportunityStatus,
  OpportunityType,
  ArsenalProject,
} from '@/lib/types';
import { generateId } from '@/lib/id';
import { computeUrlHash } from '@/lib/hash';
import { X } from 'lucide-react';
import { DeadlinePicker } from '@/components/DeadlinePicker';
import { parseValue } from '@/lib/deadline-picker-utils';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ArsenalProject[];
  nextCodeNumber: number;
  onCreate: (opp: Opportunity) => void;
}

export default function NewOpportunityModal({
  isOpen,
  onClose,
  projects,
  nextCodeNumber,
  onCreate,
}: NewOpportunityModalProps) {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState<OpportunityType>('hackathon');
  const [status, setStatus] = useState<OpportunityStatus>('active');
  const [deadlineInput, setDeadlineInput] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [applicationCopy, setApplicationCopy] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [initialTask, setInitialTask] = useState('');

  if (!isOpen) return null;

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const parsedDeadline = parseValue(deadlineInput);
    const deadlineIso = parsedDeadline ? parsedDeadline.toISOString() : null;
    const trimmedUrl = url.trim();

    const newOpp: Opportunity = {
      id: generateId('opp'),
      code: `ORB-${String(nextCodeNumber).padStart(2, '0')}`,
      title: title.trim(),
      organization: organization.trim() || 'Independent',
      type,
      status,
      deadline: deadlineIso,
      progress: 0,
      tasksDone: 0,
      tasksTotal: initialTask.trim() ? 1 : 0,
      projectIds: selectedProjectIds,
      url: trimmedUrl || null,
      urlHash: computeUrlHash(trimmedUrl || `https://orbit.local/${Date.now()}`),
      applicationCopy: applicationCopy.trim() || null,
      notes: null,
      sourceRadarDate: null,
      sortOrder: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastActivityAt: 'just now',
      tasks: initialTask.trim()
        ? [
            {
              id: generateId('t'),
              title: initialTask.trim(),
              done: false,
              sortOrder: 1,
              createdAt: now.toISOString(),
            },
          ]
        : [],
      aiChat: [],
    };

    onCreate(newOpp);
    setTitle('');
    setOrganization('');
    setUrl('');
    setApplicationCopy('');
    setInitialTask('');
    setDeadlineInput(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/24"
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
        className="w-full max-w-[520px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] flex flex-col max-h-[calc(100vh-64px)]"
        role="dialog"
        aria-modal="true"
        aria-label="New track"
      >
        <div className="h-14 px-6 border-b border-line flex items-center justify-between shrink-0">
          <h2 className="text-[15px] font-semibold text-ink">New track</h2>
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
              <label htmlFor="new-track-title" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Title <span className="text-ink-3">*</span>
              </label>
              <input
                id="new-track-title"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Program or challenge title"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="new-track-org" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                  Organization
                </label>
                <input
                  id="new-track-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Organization or host"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="new-track-type" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                  Type
                </label>
                <select
                  id="new-track-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as OpportunityType)}
                  className="input"
                >
                  <option value="hackathon">hackathon</option>
                  <option value="fellowship">fellowship</option>
                  <option value="ambassador">ambassador</option>
                  <option value="waitlist">waitlist</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="new-track-deadline" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                  Deadline (local)
                </label>
                <DeadlinePicker
                  id="new-track-deadline"
                  value={deadlineInput}
                  onChange={setDeadlineInput}
                />
              </div>
              <div>
                <label htmlFor="new-track-tier" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                  Tier / Status
                </label>
                <select
                  id="new-track-tier"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                  className="input"
                >
                  <option value="active">Active Build (Tier 1)</option>
                  <option value="waitlist">Waitlist Watch (Tier 2)</option>
                  <option value="submitted">Submitted (Tier 3)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="new-track-url" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Program link
              </label>
              <input
                id="new-track-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="input font-mono text-[13px]"
              />
            </div>

            {projects.length > 0 && (
              <div>
                <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                  Link Arsenal project
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {projects.map((p) => {
                    const active = selectedProjectIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProject(p.id)}
                        className={`h-7 px-2.5 rounded-[6px] font-mono text-xs border transition-colors ${
                          active
                            ? 'bg-pressed border-ink text-ink font-medium'
                            : 'bg-overlay border-line text-ink-3 hover:text-ink hover:bg-hover'
                        }`}
                      >
                        {active ? `✓ ${p.title}` : `+ ${p.title}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="new-track-task" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                First sub-task
              </label>
              <input
                id="new-track-task"
                type="text"
                value={initialTask}
                onChange={(e) => setInitialTask(e.target.value)}
                placeholder="e.g. Review submission deliverables"
                className="input"
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
                <span>Create track</span>
                <span className="kbd">⌘↵</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
