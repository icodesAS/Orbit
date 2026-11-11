'use client';

import React, { useState } from 'react';
import { Cloud, LogOut, LogIn, UploadCloud, CheckCircle2 } from 'lucide-react';

interface CloudSyncSectionProps {
  user: any;
  authLoading?: boolean;
  onSignIn?: () => Promise<any>;
  onSignOut?: () => Promise<void>;
  onMigrateToCloud?: () => Promise<{ oppsCount: number; projsCount: number }>;
}

export default function CloudSyncSection({
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onMigrateToCloud,
}: CloudSyncSectionProps) {
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrate = async () => {
    if (!onMigrateToCloud) return;
    try {
      setIsMigrating(true);
      setMigrationStatus(null);
      const res = await onMigrateToCloud();
      setMigrationStatus(`Successfully synced ${res.oppsCount} opportunities & ${res.projsCount} projects to Firestore.`);
    } catch (err: any) {
      setMigrationStatus(`Migration failed: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#16181D] font-semibold">
          <Cloud className="w-4 h-4 text-[#4355B9]" />
          <span>Cloud Account & Sync</span>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded border bg-[#ECFDF3] text-[#067647] border-[#D1FADF]">
          {user ? 'Cloud Connected' : 'Auth Required'}
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
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-[#E5E5E1]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#4355B9] text-white flex items-center justify-center font-semibold text-xs">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-[#16181D]">{user.displayName || 'Firebase User'}</div>
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
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {onMigrateToCloud && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p className="text-[#6B7280] text-[11px]">
                Have existing local or demo opportunities? Copy them directly into your Firestore account.
              </p>
              <button
                type="button"
                onClick={handleMigrate}
                disabled={isMigrating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] disabled:opacity-50 text-white font-medium font-mono text-xs whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isMigrating ? 'Syncing...' : 'Migrate Local to Cloud'}</span>
              </button>
            </div>
          )}

          {migrationStatus && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#ECFDF3] border border-[#D1FADF] text-[#067647] font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{migrationStatus}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-[#F5F5F3] border border-[#E5E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[#16181D] font-medium">Sign in to synchronize with Firestore</p>
            <p className="text-[#6B7280] text-[11px] mt-0.5">
              Your opportunities, tasks, and Arsenal will be securely stored under your user account.
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
