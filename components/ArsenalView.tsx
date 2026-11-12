'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Pencil, Trash2, X, ChevronRight } from 'lucide-react';
import { ArsenalProject } from '@/lib/types';
import { generateId } from '@/lib/id';
import { isValidHttpsUrl } from '@/lib/url';
import { OrbitGlyph } from './OrbitGlyph';
import { fadeUp, spring, stagger, useSpring } from '@/lib/motion';

interface ArsenalViewProps {
  projects: ArsenalProject[];
  onAddProject: (proj: ArsenalProject) => void;
  onUpdateProject: (proj: ArsenalProject) => void;
  onDeleteProject: (id: string) => void;
}

export default function ArsenalView({
  projects, onAddProject, onUpdateProject, onDeleteProject,
}: ArsenalViewProps) {
  const [editingProject, setEditingProject] = useState<ArsenalProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const accordionSpring = useSpring('smooth');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contextBlurb, setContextBlurb] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [linksInput, setLinksInput] = useState('');

  const openCreate = () => {
    setEditingProject(null);
    setTitle(''); setDescription(''); setContextBlurb('');
    setTechStackInput(''); setLinksInput('');
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

  const closeForm = () => { setIsCreating(false); setEditingProject(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedUrls = linksInput.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const label = line.slice(0, colonIdx).trim();
        const rawUrl = line.slice(colonIdx + 1).trim();
        return { label: label || 'Link', url: rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}` };
      }
      return { label: 'Source', url: line.startsWith('http') ? line : `https://${line}` };
    }).filter((item) => isValidHttpsUrl(item.url));

    const parsedStack = techStackInput.split(',').map((s) => s.trim()).filter(Boolean);
    const now = new Date().toISOString();
    const desc = description.trim() || 'Flagship engineering system.';
    const blurb = contextBlurb.trim() || desc;

    if (editingProject) {
      onUpdateProject({ ...editingProject, title: title.trim(), description: desc, contextBlurb: blurb, techStack: parsedStack, urls: parsedUrls, updatedAt: now });
    } else {
      onAddProject({ id: generateId('proj'), title: title.trim(), description: desc, contextBlurb: blurb, techStack: parsedStack, urls: parsedUrls, usedInCount: 0, createdAt: now, updatedAt: now });
    }
    closeForm();
  };

  return (
    <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-6 text-[13.5px]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-5 border-b border-line">
        <div>
          <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.022em] text-ink">Arsenal</h1>
          <p className="text-[13.5px] text-ink-2 mt-1">Projects and technical blurbs linked to pipeline tracks.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-secondary self-start sm:self-auto">New project</button>
      </div>

      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/24"
          onClick={closeForm}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); closeForm(); } }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingProject ? 'Edit project' : 'New project'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] flex flex-col max-h-[calc(100vh-64px)]"
          >
            <div className="h-14 px-6 border-b border-line flex items-center justify-between shrink-0">
              <h2 className="text-[15px] font-semibold text-ink">{editingProject ? `Edit ${editingProject.title}` : 'New project'}</h2>
              <button type="button" aria-label="Close dialog" onClick={closeForm} className="btn btn-ghost btn-icon"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="proj-title" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Project title <span className="text-ink-3">*</span></label>
                    <input id="proj-title" type="text" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. TestEngine" className="input" />
                  </div>
                  <div>
                    <label htmlFor="proj-stack" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Tech stack (comma-separated)</label>
                    <input id="proj-stack" type="text" value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} placeholder="TypeScript, Docker, Rust" className="input font-mono text-[13px]" />
                  </div>
                </div>

                <div>
                  <label htmlFor="proj-desc" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">One-line description</label>
                  <input id="proj-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deterministic sandbox execution engine" className="input" />
                </div>

                <div>
                  <label htmlFor="proj-links" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Links (one per line, e.g. GitHub: https://...)</label>
                  <textarea id="proj-links" rows={2} value={linksInput} onChange={(e) => setLinksInput(e.target.value)} placeholder="GitHub: https://github.com/..." className="input !h-auto py-2 font-mono text-[12.5px]" />
                </div>

                <div>
                  <label htmlFor="proj-blurb" className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Context blurb (for AI matching)</label>
                  <textarea id="proj-blurb" rows={3} value={contextBlurb} onChange={(e) => setContextBlurb(e.target.value)} placeholder="Plain-English architectural details..." className="input !h-auto py-2 leading-relaxed" />
                </div>
              </div>

              <div className="h-14 px-6 bg-raised border-t border-line flex items-center justify-between shrink-0 rounded-b-[16px]">
                <span className="font-mono text-[11px] text-ink-3">Esc to cancel</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={closeForm} className="btn btn-ghost">Cancel</button>
                  <button type="submit" disabled={!title.trim()} className="btn btn-primary">{editingProject ? 'Save changes' : 'Create project'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <motion.div variants={stagger(0.06, 0.04)} initial="hidden" animate="show" className="min-h-[360px] rounded-[12px] dot-grid flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
          <motion.div variants={fadeUp}><OrbitGlyph size="lg" /></motion.div>
          <motion.h2 variants={fadeUp} className="text-[15px] font-semibold text-ink tracking-[-0.01em] mt-1">No projects yet</motion.h2>
          <motion.p variants={fadeUp} className="text-[13.5px] text-ink-2 max-w-[42ch] leading-relaxed">Add what you have built so tracks can link to it.</motion.p>
          <motion.div variants={fadeUp} className="pt-2"><button type="button" onClick={openCreate} className="btn btn-primary">New project</button></motion.div>
        </motion.div>
      ) : (
        <div className="divide-y divide-line-faint border-t border-line">
          {projects.map((project) => {
            const isExpanded = expandedId === project.id;
            const visibleStack = project.techStack.slice(0, 3);
            const extraCount = project.techStack.length - visibleStack.length;

            return (
              <div key={project.id}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(isExpanded ? null : project.id); } }}
                  className="group min-h-[48px] px-2.5 py-2 flex items-center justify-between gap-3 hover:bg-hover rounded-[8px] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={spring.snappy} className="text-ink-3 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.span>
                    <span className="text-[14px] font-medium text-ink truncate">{project.title}</span>
                    <span className="text-[13px] text-ink-3 truncate hidden sm:inline">{project.description}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden md:flex items-center gap-1">
                      {visibleStack.map((tech) => <span key={tech} className="chip">{tech}</span>)}
                      {extraCount > 0 && <span className="chip">+{extraCount}</span>}
                    </div>
                    <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
                      {project.usedInCount} track{project.usedInCount === 1 ? '' : 's'}
                    </span>
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => openEdit(project)} title="Edit project" aria-label="Edit project" className="btn btn-ghost btn-icon !w-6 !h-6"><Pencil className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => onDeleteProject(project.id)} title="Delete project" aria-label="Delete project" className="btn btn-ghost btn-icon !w-6 !h-6 hover:text-bad"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      role="region"
                      aria-label={`Details for ${project.title}`}
                      style={{ overflow: 'hidden' }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, transition: { height: accordionSpring, opacity: { duration: 0.16, delay: 0.04 } } }}
                      exit={{ height: 0, opacity: 0, transition: { height: accordionSpring, opacity: { duration: 0.12 } } }}
                    >
                      <div className="px-5 py-4 bg-raised border-y border-line space-y-2.5">
                        <p className="text-[13.5px] text-ink-2 leading-relaxed max-w-[62ch]">{project.contextBlurb || project.description}</p>
                        {project.urls.length > 0 && (
                          <div className="flex items-center gap-3 flex-wrap pt-1">
                            {project.urls.filter((u) => isValidHttpsUrl(u.url)).map((u) => (
                              <a key={u.label} href={u.url} target="_blank" rel="noopener noreferrer" className="chip hover:border-line-strong transition-colors">
                                <span>{u.label}</span>
                                <ExternalLink className="w-3 h-3 text-ink-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
