'use client';

import React, { useState } from 'react';
import { ArsenalProject } from '@/lib/types';
import { generateId } from '@/lib/id';
import { FolderGit2, Plus, ExternalLink } from 'lucide-react';

interface ArsenalViewProps {
  projects: ArsenalProject[];
  isLive?: boolean;
  hasSampleData?: boolean;
  onAddProject: (proj: ArsenalProject) => void;
  onLoadSampleData?: () => void;
}

export default function ArsenalView({
  projects,
  isLive = false,
  hasSampleData = false,
  onAddProject,
  onLoadSampleData,
}: ArsenalViewProps) {
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
      id: generateId('proj'),
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
            Flagship projects & context blurbs used by Ask AI and daily discovery to match opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
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
                placeholder="e.g. TestEngine"
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
                placeholder="TypeScript, Docker, Rust"
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
              placeholder="Lightweight test runner with deterministic sandbox verification"
              className="w-full bg-[#0a0a0d] border border-zinc-800 rounded px-3 py-1.5 text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1">
              Context Blurb (~100 words for AI matching)
            </label>
            <textarea
              rows={3}
              value={contextBlurb}
              onChange={(e) => setContextBlurb(e.target.value)}
              placeholder="Plain-English architectural summary and benchmarks used by Gemini..."
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
              Save Project
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showForm ? (
        <div className="p-8 text-center rounded border border-zinc-800/80 bg-[#0e0e12] space-y-3">
          <p className="text-xs text-zinc-400">
            No flagship projects in your Arsenal yet.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs transition-colors"
            >
              Add your first project
            </button>
            {!isLive && !hasSampleData && onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-colors"
              >
                Load sample data
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}
    </div>
  );
}
