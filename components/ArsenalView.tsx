'use client';

import React, { useState } from 'react';
import { ArsenalProject } from '@/lib/types';
import { generateId } from '@/lib/id';
import { isValidHttpsUrl } from '@/lib/url';
import { ExternalLink, Edit2, Trash2, X } from 'lucide-react';

interface ArsenalViewProps {
  projects: ArsenalProject[];
  onAddProject: (proj: ArsenalProject) => void;
  onUpdateProject: (proj: ArsenalProject) => void;
  onDeleteProject: (id: string) => void;
}

export default function ArsenalView({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: ArsenalViewProps) {
  const [editingProject, setEditingProject] = useState<ArsenalProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contextBlurb, setContextBlurb] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [linksInput, setLinksInput] = useState('');

  const openCreate = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setContextBlurb('');
    setTechStackInput('');
    setLinksInput('');
    setIsCreating(true);
  };

  const openEdit = (proj: ArsenalProject) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setContextBlurb(proj.contextBlurb);
    setTechStackInput(proj.techStack.join(', '));
    setLinksInput(proj.urls.map((u) => `${u.label}: ${u.url}`).join('\n'));
    setIsCreating(true);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedUrls = linksInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const label = line.slice(0, colonIdx).trim();
          const rawUrl = line.slice(colonIdx + 1).trim();
          const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
          return { label: label || 'Link', url };
        }
        const url = line.startsWith('http') ? line : `https://${line}`;
        return { label: 'Source', url };
      })
      .filter((item) => isValidHttpsUrl(item.url));

    const parsedStack = techStackInput.split(',').map((s) => s.trim()).filter(Boolean);
    const now = new Date().toISOString();

    if (editingProject) {
      onUpdateProject({
        ...editingProject,
        title: title.trim(),
        description: description.trim() || 'Flagship engineering system.',
        contextBlurb: contextBlurb.trim() || description.trim() || 'Context blurb for AI matching.',
        techStack: parsedStack,
        urls: parsedUrls,
        updatedAt: now,
      });
    } else {
      onAddProject({
        id: generateId('proj'),
        title: title.trim(),
        description: description.trim() || 'Flagship engineering system.',
        contextBlurb: contextBlurb.trim() || description.trim() || 'Context blurb for AI matching.',
        techStack: parsedStack,
        urls: parsedUrls,
        usedInCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    closeForm();
  };

  return (
    <div className="pt-10 px-8 max-w-[960px] mx-auto space-y-8 text-[13px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
            Arsenal
          </h1>
          <p className="text-[13px] text-ink-3 mt-0.5">
            Flagship projects and context blurbs used for AI matching.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors self-start sm:self-auto"
        >
          Add project
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="p-4 rounded-[10px] bg-surface border border-line space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-semibold text-ink text-[13px]">
              {editingProject ? `Edit ${editingProject.title}` : 'Add project'}
            </span>
            <button type="button" onClick={closeForm} className="text-ink-3 hover:text-ink p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-ink text-xs font-medium mb-1">Project title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. TestEngine"
                className="w-full h-8 bg-surface border border-line-strong rounded-md px-2.5 text-ink text-xs focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-ink text-xs font-medium mb-1">Tech stack (comma-separated)</label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="TypeScript, Docker, Rust"
                className="w-full h-8 bg-surface border border-line-strong rounded-md px-2.5 text-ink font-mono text-xs focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink text-xs font-medium mb-1">One-line description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deterministic sandbox execution engine"
              className="w-full h-8 bg-surface border border-line-strong rounded-md px-2.5 text-ink text-xs focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-ink text-xs font-medium mb-1">Links (e.g. GitHub: https://...)</label>
            <textarea
              rows={2}
              value={linksInput}
              onChange={(e) => setLinksInput(e.target.value)}
              placeholder="GitHub: https://github.com/..."
              className="w-full bg-surface border border-line-strong rounded-md p-2 text-ink font-mono text-xs focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-ink text-xs font-medium mb-1">Context blurb (for AI matching)</label>
            <textarea
              rows={3}
              value={contextBlurb}
              onChange={(e) => setContextBlurb(e.target.value)}
              placeholder="Plain-English architectural details..."
              className="w-full bg-surface border border-line-strong rounded-md p-2 text-ink text-xs focus:outline-none focus:border-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={closeForm} className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs">
              Cancel
            </button>
            <button type="submit" className="h-[30px] px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-text text-xs font-medium transition-colors">
              {editingProject ? 'Save changes' : 'Save project'}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !isCreating ? (
        <div className="pt-16 text-center space-y-1">
          <p className="text-[13px] font-medium text-ink">Arsenal is empty.</p>
          <p className="text-[13px] text-ink-3">Add flagship projects to link with opportunities.</p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {projects.map((project) => (
            <div key={project.id} className="py-3 px-2 hover:bg-hover rounded-md transition-colors space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-medium text-ink text-[13px]">{project.title}</h3>
                  <span className="font-mono text-[11.5px] text-ink-3">
                    ({project.usedInCount} tracks)
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => openEdit(project)} title="Edit" className="p-1 text-ink-3 hover:text-ink">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => onDeleteProject(project.id)} title="Delete" className="p-1 text-ink-3 hover:text-urgency-hot">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-ink-2">{project.description}</p>

              {project.techStack.length > 0 && (
                <div className="font-mono text-[11px] text-ink-3 pt-0.5">
                  {project.techStack.join(' · ')}
                </div>
              )}

              {project.urls.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap pt-0.5">
                  {project.urls.filter((u) => isValidHttpsUrl(u.url)).map((u) => (
                    <a key={u.label} href={u.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3 hover:text-ink hover:underline">
                      <span>{u.label}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
