'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Archive, Trash2 } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { ease } from '@/lib/motion';

interface OpportunityTasksListProps {
  opportunity: Opportunity;
  onToggleSubTask: (taskId: string) => void;
  onAddSubTask: (title: string) => void;
  onArchive: () => void;
  onDelete?: () => void;
}

export default function OpportunityTasksList({
  opportunity,
  onToggleSubTask,
  onAddSubTask,
  onArchive,
  onDelete,
}: OpportunityTasksListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddSubTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative pl-7 pr-4 py-3.5 bg-raised border-t border-line grid grid-cols-1 lg:grid-cols-12 gap-5 text-[13px] select-none"
    >
      <span className="absolute left-5 top-0 bottom-0 w-px bg-line" aria-hidden="true" />

      <div className="lg:col-span-7 space-y-1.5">
        <div className="flex items-center justify-between text-ink-3 pb-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em]">
            SUB-TASKS ({opportunity.tasksDone}/{opportunity.tasksTotal})
          </span>
          <span className="font-mono text-[11px] tabular-nums">{opportunity.progress}%</span>
        </div>

        <div className="space-y-0.5">
          {opportunity.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleSubTask(task.id)}
              className="w-full h-8 flex items-center gap-2.5 px-2 rounded-[6px] hover:bg-hover text-left transition-colors"
            >
              <span
                className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
                  task.done ? 'bg-primary border-primary text-primary-fg' : 'bg-overlay border-line-strong'
                }`}
              >
                {task.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <motion.path
                      d="M2 5.2L4.1 7.3L8.2 2.8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.24, ease: ease.out }}
                    />
                  </svg>
                )}
              </span>
              <span className={`flex-1 text-[13.5px] truncate ${task.done ? 'line-through text-ink-3' : 'text-ink'}`}>
                {task.title}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateTask} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1 flex items-center">
            <Plus className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setNewTaskTitle(''); } }}
              placeholder="Add sub-task..."
              className="w-full h-8 pl-8 pr-2.5 rounded-[6px] bg-transparent hover:bg-hover focus:bg-overlay border border-transparent focus:border-line-strong text-[13px] text-ink placeholder:text-ink-3 focus:outline-none transition-colors"
            />
          </div>
          {newTaskTitle.trim() && (
            <button type="submit" className="btn btn-secondary btn-sm shrink-0">Add</button>
          )}
        </form>
      </div>

      <div className="lg:col-span-5 flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-line pt-3 lg:pt-0 lg:pl-4">
        <div className="space-y-2.5">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 mb-1">APPLICATION ANGLE</div>
            <p className="text-ink-2 leading-relaxed text-[13px]">
              {opportunity.applicationCopy || 'No application copy drafted yet.'}
            </p>
          </div>
          {opportunity.notes && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 mb-1">NOTES</div>
              <p className="text-ink-3 font-mono text-[12px] leading-relaxed">{opportunity.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-line-faint">
          <span className="font-mono text-[11px] text-ink-3">{opportunity.code}</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onArchive} className="btn btn-ghost btn-sm text-ink-3 hover:text-ink" title="Move to Archived section">
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            {onDelete && (
              <button type="button" onClick={onDelete} className="btn btn-ghost btn-sm text-ink-3 hover:text-bad" title="Delete permanently">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
