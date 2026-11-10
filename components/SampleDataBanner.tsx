'use client';

import React from 'react';
import { Database, Trash2 } from 'lucide-react';

interface SampleDataBannerProps {
  isLive: boolean;
  hasSampleData: boolean;
  onRemoveSampleData: () => void;
}

export default function SampleDataBanner({
  isLive,
  hasSampleData,
  onRemoveSampleData,
}: SampleDataBannerProps) {
  // Never show in Live mode or when no sample items exist
  if (isLive || !hasSampleData) return null;

  return (
    <div
      role="status"
      aria-label="Demo Mode Sample Data Banner"
      className="bg-amber-950/40 border-b border-amber-600/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200 shrink-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold text-[11px] tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
          SAMPLE DATA
        </span>
        <span className="text-amber-200/90 truncate text-[11px]">
          Sample data is currently loaded in your workspace.
        </span>
      </div>

      <button
        type="button"
        onClick={onRemoveSampleData}
        title="Remove only sample data items (custom created items are preserved)"
        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border border-amber-500/40 text-[11px] font-mono transition-colors shrink-0 ml-3"
      >
        <Trash2 className="w-3 h-3 text-amber-300" />
        <span>Remove sample data</span>
      </button>
    </div>
  );
}
