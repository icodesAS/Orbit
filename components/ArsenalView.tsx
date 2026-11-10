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
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5E5E1]">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-[#4355B9]" />
            <h1 className="text-xl font-semibold text-[#16181D]">
              Project <span className="font-serif italic font-normal text-[#4355B9]">Arsenal</span>
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Flagship projects & context blurbs used by Ask AI and daily discovery to match opportunities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-xs font-medium text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-3 text-xs shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B7280] mb-1 font-medium">Project Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. TestEngine"
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded px-3 py-1.5 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#6B7280] mb-1 font-medium">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="TypeScript, Docker, Rust"
                className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded px-3 py-1.5 text-[#16181D] font-mono focus:bg-white focus:border-[#4355B9] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#6B7280] mb-1 font-medium">
              One-Line Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lightweight test runner with deterministic sandbox verification"
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded px-3 py-1.5 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[#6B7280] mb-1 font-medium">
              Context Blurb (~100 words for AI matching)
            </label>
            <textarea
              rows={3}
              value={contextBlurb}
              onChange={(e) => setContextBlurb(e.target.value)}
              placeholder="Plain-English architectural summary and benchmarks used by Gemini..."
              className="w-full bg-[#F5F5F3] border border-[#E5E5E1] rounded px-3 py-1.5 text-[#16181D] focus:bg-white focus:border-[#4355B9] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded bg-white border border-[#E5E5E1] text-[#6B7280] hover:text-[#16181D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium transition-colors shadow-2xs"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showForm ? (
        <div className="p-8 text-center rounded-lg border border-[#E5E5E1] bg-white space-y-3 shadow-2xs">
          <p className="text-xs text-[#6B7280]">
            No flagship projects in your Arsenal yet.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white font-mono text-xs transition-colors shadow-2xs"
            >
              Add your first project
            </button>
            {!isLive && !hasSampleData && onLoadSampleData && (
              <button
                type="button"
                onClick={onLoadSampleData}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs transition-colors shadow-2xs"
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
              className="p-4 rounded-lg bg-white border border-[#E5E5E1] flex flex-col justify-between gap-4 shadow-2xs hover:border-[#D1D1CB] transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-mono text-sm font-semibold text-[#4355B9]">
                    {project.title}
                  </h3>
                  <span className="font-mono text-[11px] text-[#6B7280] tabular-nums">
                    linked in {project.usedInCount} tracks
                  </span>
                </div>
                <p className="text-xs text-[#16181D] font-medium">
                  {project.description}
                </p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {project.contextBlurb}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5E5E1] space-y-2">
                <div className="font-mono text-[11px] text-[#6B7280]">
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
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#4355B9] hover:underline"
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
