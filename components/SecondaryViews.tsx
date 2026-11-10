'use client';

import React, { useState } from 'react';
import { RadarItem, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import {
  Radar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  FolderGit2,
  Plus,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface RadarViewProps {
  radarItems: RadarItem[];
  projectsMap: Record<string, ArsenalProject>;
  onPromoteRadarItem: (item: RadarItem) => void;
  onToggleVerifyRadarItem: (id: string) => void;
}

export function RadarView({
  radarItems,
  projectsMap,
  onPromoteRadarItem,
  onToggleVerifyRadarItem,
}: RadarViewProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-blue-400" />
            <h1 className="text-base font-semibold text-zinc-100">
              09:00 AM Gemini Discovery Radar
            </h1>
            <span className="font-mono text-xs text-zinc-500">
              · radarDays/2026-11-10
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable daily search log grounded against your Arsenal project context blurbs. Promoting an item copies it into Active Pipeline without mutating Radar history.
          </p>
        </div>

        <div className="font-mono text-xs text-zinc-400 tabular-nums shrink-0">
          CRON: 30 3 * * * (09:00 IST)
        </div>
      </div>

      <div className="divide-y divide-zinc-800/80 border border-zinc-800/80 rounded bg-[#0d0d10]">
        {radarItems.map((item) => {
          const deadlineInfo = getDeadlineInfo(item.deadline);
          const recProject = item.recommendedProjectId
            ? projectsMap[item.recommendedProjectId]
            : null;

          return (
            <div
              key={item.id}
              className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#121216] transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-zinc-400">
                    {item.organization}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <h3 className="text-sm font-medium text-zinc-100">
                    {item.title}
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:underline"
                  >
                    <span>Source ({item.source})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs font-mono text-zinc-400 flex-wrap">
                  <span>TYPE: {item.type}</span>
                  <span>·</span>
                  <span>
                    DEADLINE: {deadlineInfo.relativeLabel} (
                    {deadlineInfo.absoluteLabel})
                  </span>
                  {recProject && (
                    <>
                      <span>·</span>
                      <span className="text-blue-300">
                        MATCH: {recProject.title}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => onToggleVerifyRadarItem(item.id)}
                    className={`inline-flex items-center gap-1 transition-colors ${
                      item.verified
                        ? 'text-emerald-400'
                        : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    {item.verified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED ELIGIBILITY</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>UNVERIFIED DATE (CLICK TO CONFIRM)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.promoted ? (
                  <span className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Promoted to Pipeline</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPromoteRadarItem(item)}
                    className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Track in Pipeline</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ArsenalViewProps {
  projects: ArsenalProject[];
  onAddProject: (proj: ArsenalProject) => void;
}

export function ArsenalView({ projects, onAddProject }: ArsenalViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contextBlurb, setContextBlurb] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onAddProject({
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Flagship engineering system.',
      contextBlurb:
        contextBlurb.trim() ||
        description.trim() ||
        'Production system used for grounding Gemini Radar & Ask AI pitches.',
      techStack: techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      urls: [],
      usedInCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    setTitle('');
    setDescription('');
    setContextBlurb('');
    setTechStackInput('');
    setShowForm(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            <h1 className="text-base font-semibold text-zinc-100">
              Project Arsenal
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Flagship repositories & 100-word context blurbs injected into Scoped Ask AI and the 9:00 AM Radar prompt.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Flagship Project</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded bg-[#111115] border border-zinc-700/80 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., VectorPulse"
                className="w-full bg-[#0a0a0d] border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="Rust, CUDA, TypeScript"
                className="w-full bg-[#0a0a0d] border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              One-Line Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deterministic GPU kernel profiler for multi-tenant inference"
              className="w-full bg-[#0a0a0d] border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              100-Word Radar & Ask AI Context Blurb
            </label>
            <textarea
              rows={3}
              value={contextBlurb}
              onChange={(e) => setContextBlurb(e.target.value)}
              placeholder="Plain-English architectural summary & benchmarks used to match grants and draft essays..."
              className="w-full bg-[#0a0a0d] border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 text-white font-medium"
            >
              Save to Arsenal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 rounded bg-[#0e0e12] border border-zinc-800/90 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-mono text-sm font-semibold text-blue-300">
                  {project.title}
                </h3>
                <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                  linked in {project.usedInCount} tracks
                </span>
              </div>
              <p className="text-xs text-zinc-200 font-medium">
                {project.description}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {project.contextBlurb}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="font-mono text-[11px] text-zinc-400">
                STACK: {project.techStack.join(' · ')}
              </div>
              {project.urls.length > 0 && (
                <div className="flex items-center gap-3">
                  {project.urls.map((u) => (
                    <a
                      key={u.label}
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:underline"
                    >
                      <span>{u.label}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsView({ onResetDemo }: { onResetDemo: () => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-xs">
      <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">
            Workspace Architecture & Security Rules
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Zero-backend Demo Mode active. Server-side Gemini route wired for Scoped Ask AI with Google Search grounding.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetDemo}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs whitespace-nowrap shrink-0"
        >
          Reset Demo Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded bg-[#0e0e12] border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Isolation & Immutability Guarantees</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Every opportunity maintains its own isolated <code className="font-mono text-zinc-200">tasks</code> and <code className="font-mono text-zinc-200">aiChat</code> subcollections. Promoting a 9:00 AM Radar item clones the payload into <code className="font-mono text-zinc-200">opportunities/&#123;oppId&#125;</code> while leaving <code className="font-mono text-zinc-200">radarDays/&#123;yyyy-mm-dd&#125;</code> strictly read-only.
          </p>
        </div>

        <div className="p-4 rounded bg-[#0e0e12] border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Optimistic Mutations + 5s Undo Window</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Status transitions (<code className="font-mono text-zinc-200">S</code>), sub-task completions, and archives execute synchronously in client memory with zero confirmation dialogs and a 5-second undo buffer.
          </p>
        </div>
      </div>

      <div className="p-4 rounded bg-[#0c0c0f] border border-zinc-800 space-y-2">
        <div className="font-mono text-xs text-zinc-300">
          firestore.rules (Locked Per-User Isolation)
        </div>
        <pre className="font-mono text-[11px] text-zinc-400 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }
    match /users/{userId} {
      match /opportunities/{oppId}/{document=**} {
        allow read, write: if isOwner(userId);
      }
      match /projects/{projectId} {
        allow read, write: if isOwner(userId);
      }
      match /radarDays/{day}/items/{itemId} {
        allow read: if isOwner(userId);
        allow update: if isOwner(userId)
          && request.resource.data.diff(resource.data)
             .affectedKeys().hasOnly(['promoted', 'verified']);
      }
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
