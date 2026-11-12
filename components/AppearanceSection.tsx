'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export default function AppearanceSection() {
  return (
    <section className="space-y-3 pt-2">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">Appearance</h2>
        <p className="text-[13px] text-ink-3 mt-0.5">Customize your viewing theme on this device.</p>
      </div>

      <div className="rounded-[12px] bg-raised border border-line p-4 text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-ink">Theme mode</p>
          <p className="text-[13px] text-ink-3 mt-0.5">Choose between light, dark, or sync with your system preference.</p>
        </div>
        <ThemeToggle variant="segmented" />
      </div>
    </section>
  );
}
