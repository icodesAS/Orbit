'use client';

import React, { useState } from 'react';

interface CloudSyncSectionProps {
  user: any;
  authLoading?: boolean;
  onSignIn?: () => Promise<any>;
  onSignOut?: () => Promise<void>;
  onImportLocalToAccount?: () => Promise<{ oppsCount: number; projsCount: number }>;
  onClearLocalData?: () => void;
}

export default function CloudSyncSection({
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onImportLocalToAccount,
  onClearLocalData,
}: CloudSyncSectionProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearOffer, setShowClearOffer] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!onSignIn || isSigningIn) return;
    try {
      setIsSigningIn(true);
      await onSignIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleImport = async () => {
    if (!onImportLocalToAccount) return;
    try {
      setIsImporting(true);
      setImportStatus(null);
      const res = await onImportLocalToAccount();
      const total = res.oppsCount + res.projsCount;
      setImportStatus(
        `Import complete, ${total} item${total === 1 ? '' : 's'} merged (${res.oppsCount} tracks, ${res.projsCount} projects). Clear the local copy from this browser?`
      );
      setShowClearOffer(true);
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearCopy = () => {
    if (onClearLocalData) {
      onClearLocalData();
      setShowClearOffer(false);
      setImportStatus('Local guest copy cleared from this browser.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[64px] py-4 flex items-center text-[12.5px] text-ink-3 font-mono">
        Checking authentication...
      </div>
    );
  }

  if (user) {
    return (
      <div className="divide-y divide-line-faint">
        <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="dot dot-ok" />
              <span className="text-[14px] font-medium text-ink">
                {user.displayName || 'Signed in, cloud sync'}
              </span>
            </div>
            <p className="text-[12.5px] text-ink-3 mt-0.5 font-mono">
              {user.email}
            </p>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="btn btn-secondary self-start sm:self-auto shrink-0"
            >
              Sign out
            </button>
          )}
        </div>

        {onImportLocalToAccount && (
          <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-medium text-ink">
                Import local guest data
              </p>
              <p className="text-[13px] text-ink-3 mt-0.5">
                Merge guest items saved in this browser into your account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              data-loading={isImporting || undefined}
              className="btn btn-secondary self-start sm:self-auto shrink-0"
            >
              Import local data
            </button>
          </div>
        )}

        {importStatus && (
          <div className="py-3 px-3.5 my-2 rounded-[8px] bg-raised border border-line text-[12.5px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-ink-2 font-mono text-[12px]">{importStatus}</span>
            {showClearOffer && onClearLocalData && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowClearOffer(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={handleClearCopy}
                  className="btn btn-danger btn-sm"
                >
                  Clear local copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p className="text-[14px] font-medium text-ink">Google account</p>
        <p className="text-[13px] text-ink-3 mt-0.5">
          Sign in to sync your pipeline across devices and enable Ask AI.
        </p>
      </div>
      {onSignIn && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          data-loading={isSigningIn || undefined}
          className="btn btn-primary self-start sm:self-auto shrink-0"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
