'use client';

import { useReducedMotion } from 'motion/react';

export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 },
  smooth: { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 },
  sheet:  { type: 'spring', stiffness: 380, damping: 36, mass: 1 },
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const dur = {
  fast: 0.12,
  base: 0.18,
  slow: 0.28,
  exit: 0.12,
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: ease.out },
  },
};

export const stagger = (gap = 0.035, delay = 0.04) => ({
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

export function useSpring(name: keyof typeof spring) {
  const reduce = useReducedMotion();
  return reduce ? ({ duration: 0 } as const) : spring[name];
}
