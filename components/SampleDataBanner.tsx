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
      className="bg-[#FEF0C7] border-b border-[#FEDF89] px-4 py-1.5 flex items-center justify-between text-xs text-[#B54708] shrink-0 select-none"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Database className="w-3.5 h-3.5 text-[#B54708] shrink-0" />
        <span className="font-semibold text-[10px] tracking-wide uppercase px-1.5 py-0.2 rounded bg-[#B54708]/15 text-[#B54708] font-mono border border-[#B54708]/20">
          SAMPLE DATA
        </span>
        <span className="text-[#B54708]/90 truncate text-xs">
          Sample data is currently loaded in your workspace.
        </span>
      </div>

      <button
        type="button"
        onClick={onRemoveSampleData}
        title="Remove only sample data items (custom created items are preserved)"
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white hover:bg-[#F5F5F3] text-[#B54708] border border-[#FEDF89] text-[11px] font-mono transition-colors shrink-0 ml-3 shadow-2xs"
      >
        <Trash2 className="w-3 h-3 text-[#B54708]" />
        <span>Remove sample data</span>
      </button>
    </div>
  );
}
