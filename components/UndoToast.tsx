'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UndoAction } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import { spring } from '@/lib/motion';

interface UndoToastProps {
  undoAction: UndoAction | null;
  onUndo: () => void;
  onDismiss?: () => void;
}

export default function UndoToast({
  undoAction,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  useEffect(() => {
    if (!undoAction || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [undoAction, onDismiss]);

  if (!undoAction) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: spring.snappy }}
        exit={{ opacity: 0, y: 12, transition: { duration: 0.12 } }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-[12px] bg-overlay border border-line shadow-[var(--shadow-pop)] text-[13px] select-none"
        role="status"
        aria-live="polite"
      >
        <span className="text-ink font-medium">{undoAction.message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="btn btn-primary btn-sm"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
