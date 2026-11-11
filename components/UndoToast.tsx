'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UndoAction } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

interface UndoToastProps {
  undoAction: UndoAction | null;
  onUndo: () => void;
  onDismiss?: () => void;
}

export default function UndoToast({ undoAction, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    if (!undoAction || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [undoAction, onDismiss]);

  if (!undoAction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-[#E5E5E1] shadow-xl text-xs select-none"
        role="status"
        aria-live="polite"
      >
        <span className="text-[#16181D] font-medium">{undoAction.message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium font-mono text-[11px] transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo (5s)</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
