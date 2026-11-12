'use client';

import React from 'react';
import { useReducedMotion } from 'motion/react';

interface OrbitGlyphProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OrbitGlyph({ size = 'sm', className = '' }: OrbitGlyphProps) {
  const reduceMotion = useReducedMotion();

  if (size === 'lg') {
    return (
      <svg
        width={56}
        height={56}
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
        className={`shrink-0 select-none ${className}`}
      >
        {/* Subtle ambient stars */}
        <circle cx="11" cy="14" r="1" fill="var(--ink-4)" />
        <circle cx="46" cy="12" r="1.2" fill="var(--ink-4)" />
        <circle cx="43" cy="44" r="1" fill="var(--ink-4)" />

        {/* Inner tilted elliptical ring */}
        <ellipse
          cx="28"
          cy="28"
          rx="13"
          ry="6.5"
          transform="rotate(-20 28 28)"
          stroke="var(--ink-4)"
          strokeWidth="1"
        />

        {/* Outer tilted elliptical ring */}
        <ellipse
          cx="28"
          cy="28"
          rx="23"
          ry="11"
          transform="rotate(-20 28 28)"
          stroke="var(--ink-4)"
          strokeWidth="1"
        />

        {/* Center core */}
        <circle cx="28" cy="28" r="3" fill="var(--ink)" />

        {/* Satellite dot on the outer ring */}
        <g transform="rotate(-20 28 28)">
          {reduceMotion ? (
            <circle cx="51" cy="28" r="2.5" fill="var(--ink-2)" />
          ) : (
            <circle r="2.5" fill="var(--ink-2)">
              <animateMotion
                dur="24s"
                repeatCount="indefinite"
                path="M 51 28 A 23 11 0 1 1 5 28 A 23 11 0 1 1 51 28 Z"
              />
            </circle>
          )}
        </g>
      </svg>
    );
  }

  const px = size === 'md' ? 28 : 16;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 select-none ${className}`}
    >
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4.8"
        transform="rotate(-22 12 12)"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <circle cx="19.8" cy="8.8" r="1.5" fill="currentColor" />
    </svg>
  );
}
