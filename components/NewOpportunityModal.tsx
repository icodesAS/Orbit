'use client';

import React, { useState } from 'react';
import {
  Opportunity,
  OpportunityStatus,
  OpportunityType,
  ArsenalProject,
} from '@/lib/types';
import { X, Plus } from 'lucide-react';

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
  const [daysUntilDeadline, setDaysUntilDeadline] = useState('2');
  const [url, setUrl] = useState('');
  const [applicationCopy, setApplicationCopy] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([
    'proj-patchtree',
  ]);
  const [initialTask, setInitialTask] = useState(
    'Draft technical abstract & benchmark reproduction'
  );

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
    const deadlineDate = new Date(
      now.getTime() + parseFloat(daysUntilDeadline || '5') * 24 * 3600 * 1000
    );

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      code: `ORB-${nextCodeNumber}`,
      title: title.trim(),
      organization: organization.trim() || 'Independent',
      type,
      status,
      deadline: deadlineDate.toISOString(),
      progress: 0,
      tasksDone: 0,
      tasksTotal: initialTask.trim() ? 1 : 0,
      projectIds: selectedProjectIds,
      url: url.trim() || null,
      urlHash: `sha256-${Math.random().toString(16).slice(2, 10)}`,
      applicationCopy:
        applicationCopy.trim() ||
        'Technical submission anchored by linked Arsenal repositories.',
      notes: null,
      sourceRadarDate: null,
      sortOrder: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastActivityAt: 'just now',
      tasks: initialTask.trim()
        ? [
            {
              id: `t-${Date.now()}-1`,
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
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg bg-[#111115] border border-zinc-700/90 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Create New Opportunity"
      >
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-400">
              ORB-{nextCodeNumber}
            </span>
            <h2 className="text-sm font-semibold text-zinc-100">
              New Opportunity Track
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Solana AI Agentic Hackathon"
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g., Solana Foundation"
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Tier</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-2.5 py-2 text-zinc-100 font-mono focus:outline-none"
              >
                <option value="active">Active Build</option>
                <option value="waitlist">Waitlist Watch</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-2.5 py-2 text-zinc-100 font-mono focus:outline-none"
              >
                <option value="hackathon">hackathon</option>
                <option value="fellowship">fellowship</option>
                <option value="ambassador">ambassador</option>
                <option value="waitlist">waitlist</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                Deadline Horizon
              </label>
              <select
                value={daysUntilDeadline}
                onChange={(e) => setDaysUntilDeadline(e.target.value)}
                className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-2.5 py-2 text-zinc-100 font-mono focus:outline-none"
              >
                <option value="0.75">18h (Red Heat)</option>
                <option value="2">2 days (Amber Heat)</option>
                <option value="5">5 days (Grey)</option>
                <option value="14">14 days (Grey)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              Link Flagship Projects from Arsenal
            </label>
            <div className="flex flex-wrap gap-2">
              {projects.map((p) => {
                const active = selectedProjectIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className={`px-2.5 py-1.5 rounded font-mono text-xs border transition-colors ${
                      active
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              First Execution Sub-Task
            </label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">
              Application Pitch / Notes
            </label>
            <textarea
              rows={2}
              value={applicationCopy}
              onChange={(e) => setApplicationCopy(e.target.value)}
              placeholder="Core technical thesis or prize track target..."
              className="w-full bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Track</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
