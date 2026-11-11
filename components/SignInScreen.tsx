'use client';

import React, { useState } from 'react';
import { LogIn, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen w-screen bg-[#F5F5F3] text-[#16181D] font-sans flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white border border-[#E5E5E1] rounded-lg p-6 space-y-6 shadow-2xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#4355B9]/10 border border-[#4355B9]/20 flex items-center justify-center text-[#4355B9] font-mono font-bold text-xs">
              OR
            </div>
            <span className="font-semibold text-base tracking-tight text-[#16181D]">
              Orbit
            </span>
          </div>
          <h1 className="text-xl font-semibold text-[#16181D]">
            Opportunity <span className="font-serif italic font-normal text-[#4355B9]">Workspace</span>
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Track fellowships, residencies, hackathons, and developer perks alongside your project Arsenal.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-[#FEE4E2] border border-[#FECDCA] text-xs text-[#D92D20]">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={signingIn || authLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] disabled:opacity-50 text-white font-medium text-xs transition-colors shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <div className="space-y-2 pt-2 border-t border-[#E5E5E1]">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-medium text-xs transition-colors"
            >
              <span>Continue as guest</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            <p className="text-[11px] text-[#6B7280] text-center leading-relaxed">
              Saved on this device only. Clearing browser data deletes it. Sign in to sync and use AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
