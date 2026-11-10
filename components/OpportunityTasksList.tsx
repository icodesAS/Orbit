'use client';

import React, { useState } from 'react';
import { Opportunity } from '@/lib/types';
import { CheckSquare, Square, Plus, Archive } from 'lucide-react';

interface OpportunityTasksListProps {
  opportunity: Opportunity;
  onToggleSubTask: (taskId: string) => void;
  onAddSubTask: (title: string) => void;
  onArchive: () => void;
}

export default function OpportunityTasksList({
  opportunity,
  onToggleSubTask,
  onAddSubTask,
  onArchive,
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
      className="px-10 py-3 bg-[#09090b] border-t border-zinc-800/70 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs"
    >
      {/* Left 7 cols: Interactive Sub-task Checklist */}
      <div className="lg:col-span-7 space-y-2">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="font-medium text-zinc-300">
            Execution Sub-Tasks ({opportunity.tasksDone}/{opportunity.tasksTotal})
          </span>
          <span className="font-mono text-[11px] tabular-nums text-zinc-500">
            {opportunity.progress}% complete
          </span>
        </div>

        <div className="space-y-1">
          {opportunity.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleSubTask(task.id)}
              className="w-full flex items-center gap-2.5 py-1 px-2 rounded hover:bg-zinc-900 text-left transition-colors group/task"
            >
              {task.done ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : (
                <Square className="w-3.5 h-3.5 text-zinc-500 group-hover/task:text-zinc-300 shrink-0" />
              )}
              <span className={`flex-1 ${task.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                {task.title}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateTask} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add execution sub-task..."
            className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Right 5 cols: Application Copy, Builder Notes & Archive Control */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-zinc-800/70 pt-3 lg:pt-0 lg:pl-4">
        <div className="space-y-2">
          <div>
            <div className="text-[11px] text-zinc-400 font-medium mb-1">
              Application Angle / Pitch Copy
            </div>
            <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
              {opportunity.applicationCopy || 'No application copy drafted yet.'}
            </p>
          </div>
          {opportunity.notes && (
            <div>
              <div className="text-[11px] text-zinc-400 font-medium mb-1">
                Builder Notes
              </div>
              <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
                {opportunity.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <span className="font-mono text-[10px] text-zinc-500">
            HASH: {opportunity.urlHash ? opportunity.urlHash.slice(0, 16) + '...' : 'none'}
          </span>
          <button
            type="button"
            onClick={onArchive}
            className="px-2 py-1 rounded text-[11px] font-mono text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <Archive className="w-3 h-3" />
            <span>Archive (Undoable)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
