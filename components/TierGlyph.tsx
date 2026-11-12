import React from 'react';

export default function TierGlyph({ badge }: { badge: string }) {
  if (badge === 'TIER 1') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" fill="var(--ink)" />
      </svg>
    );
  }
  if (badge === 'TIER 2') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M 7 2 A 5 5 0 0 1 7 12 Z" fill="var(--ink)" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="var(--ink)" strokeWidth="1.4" />
      <path
        d="M4.8 7.2L6.3 8.7L9.3 5.5"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
