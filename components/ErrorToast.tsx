'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed bottom-20 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-[#EF4444]/30 shadow-xl text-xs select-none"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
        <span className="text-[#16181D] font-medium">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#9CA3AF] hover:text-[#16181D] transition-colors ml-1 p-0.5 rounded"
          aria-label="Dismiss error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
