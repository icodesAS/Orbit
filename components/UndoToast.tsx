'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UndoAction } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

interface UndoToastProps {
  undoAction: UndoAction | null;
  onUndo: () => void;
}

export default function UndoToast({ undoAction, onUndo }: UndoToastProps) {
  if (!undoAction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#15151a] border border-zinc-700/90 shadow-2xl text-xs"
        role="status"
        aria-live="polite"
      >
        <span className="text-zinc-200">{undoAction.message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium font-mono text-[11px] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo (5s)</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
