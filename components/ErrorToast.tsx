'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { spring } from '@/lib/motion';

interface ErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: spring.snappy }}
        exit={{ opacity: 0, y: 12, transition: { duration: 0.12 } }}
        className="fixed bottom-20 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-[12px] bg-overlay border border-bad/30 shadow-[var(--shadow-pop)] text-[13px] select-none"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="w-4 h-4 text-bad shrink-0" />
        <span className="text-ink font-medium">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="btn btn-ghost btn-icon !w-6 !h-6 ml-1"
          aria-label="Dismiss error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
