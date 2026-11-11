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
import { X, Plus, Globe, Calendar } from 'lucide-react';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ArsenalProject[];
  nextCodeNumber: number;
  onCreate: (opp: Opportunity) => void;
}

function getDefaultDatetimeLocal(): string {
  const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const [deadlineInput, setDeadlineInput] = useState(getDefaultDatetimeLocal);
  const [url, setUrl] = useState('');
  const [applicationCopy, setApplicationCopy] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() =>
    projects[0] ? [projects[0].id] : []
  );
  const [initialTask, setInitialTask] = useState('Review submission requirements and deliverables');

  if (!isOpen) return null;

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    let deadlineIso = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
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
      applicationCopy:
        applicationCopy.trim() || 'Technical submission anchored by linked Arsenal repositories.',
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
    onClose();
  };

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
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-lg bg-white border border-[#E5E5E1] shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Create New Opportunity"
      >
        <div className="px-5 py-3.5 border-b border-[#E5E5E1] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#4355B9] font-medium">
              ORB-{String(nextCodeNumber).padStart(2, '0')}
            </span>
            <h2 className="text-sm font-semibold text-[#16181D]">
              New Opportunity Track
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#16181D] font-medium mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gemini 2.5 Pro Multimodal Challenge"
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#16181D] font-medium mb-1">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Google Cloud"
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#16181D] font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-2.5 py-1.5 text-[#16181D] font-mono focus:outline-none"
              >
                <option value="hackathon">hackathon</option>
                <option value="fellowship">fellowship</option>
                <option value="ambassador">ambassador</option>
                <option value="waitlist">waitlist</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Deadline (Local Time) *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-2.5 py-1.5 text-[#16181D] font-mono focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-[#16181D] font-medium mb-1">Tier / Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-2.5 py-1.5 text-[#16181D] font-mono focus:outline-none"
              >
                <option value="active">Active Build (Tier 1)</option>
                <option value="waitlist">Waitlist Watch (Tier 2)</option>
                <option value="submitted">Submitted (Tier 3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#16181D] font-medium mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Source or Program URL</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/apply"
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] focus:outline-none font-mono text-xs"
            />
          </div>

          {projects.length > 0 && (
            <div>
              <label className="block text-[#16181D] font-medium mb-1">Link Arsenal Projects</label>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((p) => {
                  const active = selectedProjectIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProject(p.id)}
                      className={`px-2.5 py-1 rounded font-mono text-xs border transition-colors ${
                        active
                          ? 'bg-[#4355B9]/10 border-[#4355B9]/40 text-[#4355B9] font-medium'
                          : 'bg-[#F5F5F3] border-[#E5E5E1] text-[#6B7280] hover:text-[#16181D]'
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
            <label className="block text-[#16181D] font-medium mb-1">First Sub-Task</label>
            <input
              type="text"
              value={initialTask}
              onChange={(e) => setInitialTask(e.target.value)}
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#16181D] font-medium mb-1">Application Pitch / Notes</label>
            <textarea
              rows={2}
              value={applicationCopy}
              onChange={(e) => setApplicationCopy(e.target.value)}
              placeholder="Core thesis or application focus..."
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E1]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-white border border-[#E5E5E1] text-[#6B7280] hover:text-[#16181D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
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
