'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronRight, ExternalLink, Pencil, Sparkles,
  ArrowRight, FolderGit2, Check, Search,
} from 'lucide-react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import { isValidHttpsUrl } from '@/lib/url';
import OpportunityTasksList from './OpportunityTasksList';
import { dur, ease, spring, useSpring } from '@/lib/motion';

interface OpportunityCardProps {
  opportunity: Opportunity;
  allProjects: ArsenalProject[];
  isFocused: boolean;
  isExpanded: boolean;
  isProjectPickerOpen: boolean;
  canUseAi?: boolean;
  onFocus: () => void;
  onToggleExpand: () => void;
  onOpenEdit: () => void;
  onToggleProjectPicker: () => void;
  onOpenAskAI: () => void;
  onAdvanceStatus: () => void;
  onToggleProjectLink: (projectId: string) => void;
  onToggleSubTask: (taskId: string) => void;
  onAddSubTask: (title: string) => void;
  onArchive: () => void;
  onDelete?: () => void;
}

export default function OpportunityCard({
  opportunity, allProjects, isFocused, isExpanded, isProjectPickerOpen,
  canUseAi = false, onFocus, onToggleExpand, onOpenEdit,
  onToggleProjectPicker, onOpenAskAI, onAdvanceStatus,
  onToggleProjectLink, onToggleSubTask, onAddSubTask, onArchive, onDelete,
}: OpportunityCardProps) {
  const [projectQuery, setProjectQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const accordionSpring = useSpring('smooth');

  const deadlineInfo = getDeadlineInfo(opportunity.deadline, opportunity.status);
  const linkedProjects = opportunity.projectIds
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter((p): p is ArsenalProject => Boolean(p));

  useEffect(() => {
    if (!isProjectPickerOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onToggleProjectPicker();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isProjectPickerOpen, onToggleProjectPicker]);

  const hrs = deadlineInfo.hoursRemaining;
  const countdownColor =
    hrs !== null && hrs <= 6 ? 'text-bad font-medium' :
    hrs !== null && hrs <= 24 ? 'text-warn font-medium' :
    hrs !== null && hrs <= 48 ? 'text-ink-2' : 'text-ink-3';

  const filteredProjects = allProjects.filter((p) =>
    p.title.toLowerCase().includes(projectQuery.trim().toLowerCase())
  );

  const progressPct = opportunity.tasksTotal > 0
    ? Math.round((opportunity.tasksDone / opportunity.tasksTotal) * 100)
    : 0;

  return (
    <div
      onClick={onFocus}
      className={`group relative transition-colors rounded-[8px] ${
        isFocused ? 'bg-pressed' : 'hover:bg-hover'
      }`}
    >
      <div className="min-h-[44px] py-1.5 px-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[14px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="w-5 h-5 flex items-center justify-center rounded-[4px] text-ink-3 hover:text-ink transition-colors shrink-0"
          >
            <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={spring.snappy} className="flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.span>
          </button>

          <span className={`dot shrink-0 ${deadlineInfo.heat === 'red' ? 'dot-bad' : deadlineInfo.heat === 'amber' ? 'dot-warn' : ''}`} />

          <span className="font-medium text-ink truncate text-[14px]" title={opportunity.title}>
            {opportunity.title}
          </span>

          <span className="text-ink-3 truncate text-[13px] shrink-0">
            {opportunity.organization}
          </span>

          {opportunity.url && isValidHttpsUrl(opportunity.url) && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open source"
              aria-label="Open source"
              className="text-ink-3 hover:text-ink transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div ref={pickerRef} className="relative" onClick={(e) => e.stopPropagation()}>
            {linkedProjects.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: dur.base, ease: ease.out } }}
                type="button"
                onClick={onToggleProjectPicker}
                title="Pick project (P)"
                className="chip hover:border-line-strong transition-colors max-w-[140px] truncate"
              >
                <FolderGit2 className="w-3 h-3 text-ink-3 shrink-0" />
                <span className="truncate">{linkedProjects.map((p) => p.title).join(', ')}</span>
              </motion.button>
            )}

            <AnimatePresence>
              {isProjectPickerOpen && (
                <motion.div
                  role="dialog"
                  aria-label="Link a project"
                  initial={{ opacity: 0, scale: 0.98, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: dur.fast, ease: ease.out } }}
                  exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleProjectPicker();
                    }
                  }}
                  className="absolute right-0 top-[calc(100%+6px)] z-40 w-[260px] rounded-[12px] bg-overlay border border-line shadow-[var(--shadow-pop)] overflow-hidden"
                >
                  <div className="p-2 border-b border-line flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-ink-3 shrink-0 ml-1" />
                    <input
                      type="text"
                      autoFocus
                      value={projectQuery}
                      onChange={(e) => setProjectQuery(e.target.value)}
                      placeholder="Link a project..."
                      className="w-full h-6 bg-transparent text-[13px] text-ink placeholder:text-ink-4 focus:outline-none"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {filteredProjects.length === 0 ? (
                      <div className="py-3 px-2.5 text-[12.5px] text-ink-3 text-center">No Arsenal projects found</div>
                    ) : (
                      filteredProjects.map((proj) => {
                        const isLinked = opportunity.projectIds.includes(proj.id);
                        return (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => onToggleProjectLink(proj.id)}
                            className="w-full h-8 px-2.5 rounded-[6px] flex items-center justify-between gap-2 text-left text-[13px] hover:bg-hover transition-colors"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <FolderGit2 className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                              <span className="text-ink truncate">{proj.title}</span>
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              {proj.techStack[0] && <span className="font-mono text-[11px] text-ink-3">{proj.techStack[0]}</span>}
                              {isLinked && <Check className="w-3.5 h-3.5 text-ink" />}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="chip">{opportunity.type}</span>

          <div className="flex items-center gap-1.5" title="Sub-tasks completed">
            <span className="font-mono text-[11.5px] text-ink-3 tabular-nums">
              {opportunity.tasksDone}/{opportunity.tasksTotal}
            </span>
            <div className="w-10 h-[2px] rounded-full bg-line overflow-hidden hidden md:block">
              <div className="h-full bg-ink transition-all duration-150" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {opportunity.deadline && (
            <span className={`font-mono text-[12px] tabular-nums ${countdownColor}`}>
              {deadlineInfo.relativeLabel}
            </span>
          )}

          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <button type="button" onClick={onToggleProjectPicker} title="Pick project (P)" aria-label="Pick project (P)" className="btn btn-ghost btn-icon !w-6 !h-6">
              <FolderGit2 className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onOpenEdit} title="Edit track (E)" aria-label="Edit track (E)" className="btn btn-ghost btn-icon !w-6 !h-6">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onOpenAskAI} title={canUseAi ? 'Ask AI (A)' : 'Sign in to use AI'} aria-label="Ask AI (A)" className="btn btn-ghost btn-icon !w-6 !h-6">
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onAdvanceStatus} title="Advance status (S)" aria-label="Advance status (S)" className="btn btn-ghost btn-icon !w-6 !h-6">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            role="region"
            aria-label={`Sub-tasks for ${opportunity.title}`}
            style={{ overflow: 'hidden' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: accordionSpring, opacity: { duration: 0.16, delay: 0.04 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: accordionSpring, opacity: { duration: 0.12 } } }}
          >
            <OpportunityTasksList
              opportunity={opportunity}
              onToggleSubTask={onToggleSubTask}
              onAddSubTask={onAddSubTask}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
