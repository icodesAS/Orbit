'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { OrbitGlyph } from './OrbitGlyph';
import { fadeUp, stagger } from '@/lib/motion';

interface SignInScreenProps {
  onSignIn: () => Promise<any>;
  onContinueAsGuest: () => void;
  authLoading?: boolean;
}

export default function SignInScreen({
  onSignIn,
  onContinueAsGuest,
  authLoading = false,
}: SignInScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setSigningIn(true);
      await onSignIn();
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-canvas text-ink font-sans flex items-center justify-center p-6 select-none relative">
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <motion.div
        variants={stagger(0.05, 0.03)}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[360px] bg-overlay border border-line rounded-[16px] p-8 space-y-5 shadow-[var(--shadow-sm)]"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2.5">
          <OrbitGlyph size="md" className="text-ink" />
          <span className="font-semibold text-[16px] tracking-[-0.015em] text-ink">
            Orbit
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5">
          <h1 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">
            Sign in to sync your workspace
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-relaxed">
            Tracks, projects and your radar sync across devices.
          </p>
        </motion.div>

        {error && (
          <div className="p-2.5 rounded-[8px] bg-bad-soft text-[12.5px] text-bad">
            {error}
          </div>
        )}

        <motion.div variants={fadeUp} className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={signingIn || authLoading}
            data-loading={signingIn || undefined}
            className="btn btn-primary btn-lg w-full"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] text-ink-3">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="btn btn-ghost btn-lg w-full"
          >
            Continue as guest
          </button>

          <p className="font-mono text-[11.5px] text-ink-3 text-center leading-relaxed">
            Saved on this device only. Clearing browser data deletes it. Sign in to sync and use AI.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
