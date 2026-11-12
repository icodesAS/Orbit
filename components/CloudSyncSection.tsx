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

  const handleImport = async () => {
    if (!onImportLocalToAccount) return;
    try {
      setIsImporting(true);
      setImportStatus(null);
      const res = await onImportLocalToAccount();
      setImportStatus(
        `Imported ${res.oppsCount} opportunities and ${res.projsCount} projects.`
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
      <div className="py-3 text-xs text-ink-3 font-mono">
        Checking authentication...
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-3">
        <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-medium text-ink text-[13px]">
                {user.displayName || 'Signed in'}
              </span>
            </div>
            <p className="text-xs text-ink-3 mt-0.5 font-mono">
              {user.email}
            </p>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors self-start sm:self-auto"
            >
              Sign out
            </button>
          )}
        </div>

        {onImportLocalToAccount && (
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-line">
            <div>
              <p className="font-medium text-ink text-[13px]">Import local guest data</p>
              <p className="text-xs text-ink-3 mt-0.5">
                Merge guest items saved in this browser into your account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
            >
              {isImporting ? 'Importing...' : 'Import local data'}
            </button>
          </div>
        )}

        {importStatus && (
          <div className="p-2 rounded bg-canvas-sunken border border-line text-xs font-mono flex items-center justify-between gap-2">
            <span className="text-ink-2">{importStatus}</span>
            {showClearOffer && onClearLocalData && (
              <button
                type="button"
                onClick={handleClearCopy}
                className="text-xs text-urgency-hot hover:underline shrink-0"
              >
                Clear local copy
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p className="font-medium text-ink text-[13px]">Google account</p>
        <p className="text-xs text-ink-3 mt-0.5">
          Sign in to sync your pipeline across devices and enable AI.
        </p>
      </div>
      {onSignIn && (
        <button
          type="button"
          onClick={onSignIn}
          className="h-[30px] px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-text text-xs font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
