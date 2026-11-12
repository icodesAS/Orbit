'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { Opportunity } from '@/lib/types';
import { spring, useSpring } from '@/lib/motion';

interface ArchivedSectionProps {
  archivedOpportunities: Opportunity[];
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
}

export default function ArchivedSection({
  archivedOpportunities,
  onRestore,
  onDeletePermanently,
}: ArchivedSectionProps) {
  const [open, setOpen] = useState(false);
  const accordionSpring = useSpring('smooth');

  if (archivedOpportunities.length === 0) return null;

  return (
    <section className="pt-4 border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-9 px-2 flex items-center justify-between text-left hover:bg-hover rounded-[8px] transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={spring.snappy}
            className="text-ink-3 flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
            Archived ({archivedOpportunities.length})
          </span>
        </div>
        <span className="font-mono text-[11px] text-ink-3">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            style={{ overflow: 'hidden' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: { height: accordionSpring, opacity: { duration: 0.16, delay: 0.04 } },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { height: accordionSpring, opacity: { duration: 0.12 } },
            }}
          >
            <div className="mt-1 divide-y divide-line-faint rounded-[8px] bg-raised border border-line px-3 py-1">
              {archivedOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="min-h-[42px] py-1.5 flex items-center justify-between gap-3 text-[13.5px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-ink-3 shrink-0">
                      {opp.code}
                    </span>
                    <span className="text-ink-2 font-medium truncate">
                      {opp.title}
                    </span>
                    <span className="text-ink-3 text-[12.5px] truncate hidden sm:inline">
                      {opp.organization}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestore(opp.id)}
                      className="btn btn-secondary btn-sm"
                      title="Restore to Active Build"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePermanently(opp.id)}
                      className="btn btn-danger btn-sm"
                      title="Permanently delete from database"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
