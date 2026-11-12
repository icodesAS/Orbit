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
  const [deadlineInput, setDeadlineInput] = useState('');
  const [url, setUrl] = useState('');
  const [applicationCopy, setApplicationCopy] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [initialTask, setInitialTask] = useState('');

  if (!isOpen) return null;

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    let deadlineIso: string | null = null;
    if (deadlineInput) {
      const parsed = new Date(deadlineInput);
      if (!isNaN(parsed.getTime())) {
        deadlineIso = parsed.toISOString();
      }
    }

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
    setDeadlineInput('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
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
        className="w-full max-w-[480px] rounded-[10px] bg-surface border border-line shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label="New track"
      >
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between shrink-0">
          <h2 className="text-[15px] font-semibold text-ink">
            New track
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto text-[13px]">
          <div>
            <label className="block text-ink text-xs font-medium mb-1.5">Title *</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Program or challenge title"
              className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2.5 text-ink text-xs focus:outline-none placeholder:text-ink-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink text-xs font-medium mb-1.5">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization or host"
                className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2.5 text-ink text-xs focus:outline-none placeholder:text-ink-3"
              />
            </div>
            <div>
              <label className="block text-ink text-xs font-medium mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2 text-ink text-xs focus:outline-none"
              >
                <option value="hackathon">hackathon</option>
                <option value="fellowship">fellowship</option>
                <option value="ambassador">ambassador</option>
                <option value="waitlist">waitlist</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink text-xs font-medium mb-1.5">Deadline (local)</label>
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2 text-ink font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-ink text-xs font-medium mb-1.5">Tier / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2 text-ink text-xs focus:outline-none"
              >
                <option value="active">Active Build (Tier 1)</option>
                <option value="waitlist">Waitlist Watch (Tier 2)</option>
                <option value="submitted">Submitted (Tier 3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-ink text-xs font-medium mb-1.5">Program link</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2.5 text-ink font-mono text-xs focus:outline-none placeholder:text-ink-3"
            />
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-ink text-xs font-medium mb-1.5">Link Arsenal project</label>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((p) => {
                  const active = selectedProjectIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProject(p.id)}
                      className={`h-7 px-2 rounded-md font-mono text-xs border transition-colors ${
                        active
                          ? 'bg-selected border-ink text-ink font-medium'
                          : 'bg-surface border-line text-ink-3 hover:text-ink'
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
            <label className="block text-ink text-xs font-medium mb-1.5">First sub-task</label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              placeholder="e.g. Review submission deliverables"
              className="w-full h-8 bg-surface border border-line-strong focus:border-ink rounded-md px-2.5 text-ink text-xs focus:outline-none placeholder:text-ink-3"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line">
            <span className="font-mono text-[11px] text-ink-3">
              Esc to cancel
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[30px] px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-text text-xs font-medium transition-colors"
              >
                Create track
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
