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
      className="px-10 py-3 bg-[#F5F5F3] border-t border-[#E5E5E1] grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs select-none"
    >
      {/* Left 7 cols: Interactive Sub-task Checklist */}
      <div className="lg:col-span-7 space-y-2">
        <div className="flex items-center justify-between text-[#6B7280]">
          <span className="font-medium text-[#16181D]">
            Execution Sub-Tasks ({opportunity.tasksDone}/{opportunity.tasksTotal})
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[#6B7280]">
            {opportunity.progress}% complete
          </span>
        </div>

        <div className="space-y-1">
          {opportunity.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleSubTask(task.id)}
              className="w-full flex items-center gap-2.5 py-1 px-2 rounded hover:bg-white text-left transition-colors group/task"
            >
              {task.done ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#4355B9] shrink-0" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#6B7280] group-hover/task:text-[#16181D] shrink-0" />
              )}
              <span className={`flex-1 text-xs ${task.done ? 'line-through text-[#6B7280]' : 'text-[#16181D]'}`}>
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
            className="flex-1 bg-white border border-[#E5E5E1] rounded px-2.5 py-1 text-xs text-[#16181D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#4355B9]"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-white hover:bg-[#ECECE8] border border-[#E5E5E1] text-[#16181D] font-mono text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#4355B9]" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Right 5 cols: Application Copy, Builder Notes & Archive Control */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-[#E5E5E1] pt-3 lg:pt-0 lg:pl-4">
        <div className="space-y-2">
          <div>
            <div className="text-[11px] text-[#6B7280] font-medium mb-1">
              Application Angle / Pitch Copy
            </div>
            <p className="text-[#16181D] leading-relaxed bg-white p-2.5 rounded border border-[#E5E5E1] text-xs shadow-2xs">
              {opportunity.applicationCopy || 'No application copy drafted yet.'}
            </p>
          </div>
          {opportunity.notes && (
            <div>
              <div className="text-[11px] text-[#6B7280] font-medium mb-1">
                Builder Notes
              </div>
              <p className="text-[#6B7280] font-mono text-[11px] leading-relaxed">
                {opportunity.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E1]">
          <span className="font-mono text-[10px] text-[#6B7280]">
            HASH: {opportunity.urlHash ? opportunity.urlHash.slice(0, 16) + '...' : 'none'}
          </span>
          <button
            type="button"
            onClick={onArchive}
            className="px-2 py-1 rounded text-[11px] font-mono text-[#6B7280] hover:text-[#D92D20] hover:bg-[#FEE4E2] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <Archive className="w-3 h-3" />
            <span>Archive (Undoable)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
