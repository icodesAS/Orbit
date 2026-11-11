'use client';

import React, { useState } from 'react';
import { Cloud, LogOut, LogIn, UploadCloud, CheckCircle2, Trash2 } from 'lucide-react';

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
        `Imported ${res.oppsCount} opportunities and ${res.projsCount} projects into your account.`
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

  return (
    <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#16181D] font-semibold">
          <Cloud className="w-4 h-4 text-[#4355B9]" />
          <span>Account & Cloud Sync</span>
        </div>
        <span
          className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
            user
              ? 'bg-[#ECFDF3] text-[#067647] border-[#D1FADF]'
              : 'bg-[#F5F5F3] text-[#6B7280] border-[#E5E5E1]'
          }`}
        >
          {user ? 'Signed in' : 'Guest'}
        </span>
      </div>

      {authLoading ? (
        <div className="text-[#6B7280] font-mono text-xs">Checking authentication status...</div>
      ) : user ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F3] border border-[#E5E5E1]">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-[#E5E5E1]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#4355B9] text-white flex items-center justify-center font-semibold text-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-[#16181D]">{user.displayName || 'Signed-in User'}</div>
                <div className="text-[11px] font-mono text-[#6B7280]">{user.email}</div>
              </div>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#FEE4E2] border border-[#E5E5E1] text-[#6B7280] hover:text-[#D92D20] text-xs font-mono transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            )}
          </div>

          {onImportLocalToAccount && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p className="text-[#6B7280] text-[11px]">
                Have guest items saved in this browser? Copy them into your account without duplicates.
              </p>
              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] disabled:opacity-50 text-white font-medium font-mono text-xs whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isImporting ? 'Importing...' : 'Import local data'}</span>
              </button>
            </div>
          )}

          {importStatus && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded bg-[#ECFDF3] border border-[#D1FADF] text-[#067647] font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{importStatus}</span>
              </div>
              {showClearOffer && onClearLocalData && (
                <button
                  type="button"
                  onClick={handleClearCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-[#D1FADF] text-[#16181D] hover:bg-[#FEE4E2] hover:text-[#D92D20] hover:border-[#FECDCA] text-[11px] font-mono shrink-0 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear local copy</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-[#F5F5F3] border border-[#E5E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[#16181D] font-medium">Sign in to sync and use AI</p>
            <p className="text-[#6B7280] text-[11px] mt-0.5">
              Guest data is saved on this device only. Sign in with Google to sync across devices and unlock Ask AI.
            </p>
          </div>
          {onSignIn && (
            <button
              type="button"
              onClick={onSignIn}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium text-xs whitespace-nowrap transition-colors shadow-2xs shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
