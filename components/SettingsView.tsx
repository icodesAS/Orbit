'use client';

import React, { useState, useRef } from 'react';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import CloudSyncSection from './CloudSyncSection';

interface SettingsViewProps {
  userApiKey: string;
  onUpdateApiKey: (key: string) => void;
  isFirebaseReady: boolean;
  user?: any;
  authLoading?: boolean;
  onSignIn?: () => Promise<any>;
  onSignOut?: () => Promise<void>;
  onImportLocalToAccount?: () => Promise<{ oppsCount: number; projsCount: number }>;
  onClearLocalData?: () => void;
  onExportJson: () => void;
  onImportJson: (rawText: string) => Promise<{ oppsCount: number; projsCount: number }>;
}

export default function SettingsView({
  userApiKey,
  onUpdateApiKey,
  isFirebaseReady,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onImportLocalToAccount,
  onClearLocalData,
  onExportJson,
  onImportJson,
}: SettingsViewProps) {
  const [tempKey, setTempKey] = useState(userApiKey);
  const [savedNotice, setSavedNotice] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUseAi = Boolean(user) || !isFirebaseReady;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUseAi) return;
    onUpdateApiKey(tempKey.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleClearKey = () => {
    setTempKey('');
    onUpdateApiKey('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await onImportJson(text);
      setBackupMessage(`Imported ${res.oppsCount} opportunities and ${res.projsCount} projects.`);
    } catch (err: any) {
      setBackupMessage(`Error: ${err?.message || 'Invalid backup file'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pt-10 px-8 max-w-[720px] mx-auto space-y-8 text-[13px]">
      {/* Header */}
      <div className="pb-3 border-b border-line">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-ink">
          Settings
        </h1>
        <p className="text-[13px] text-ink-3 mt-0.5">
          Workspace and account configuration.
        </p>
      </div>

      {/* Account Section */}
      <section className="space-y-2">
        <h2 className="text-xs font-medium text-ink-3">
          Account
        </h2>
        <div className="border-t border-line divide-y divide-line">
          {isFirebaseReady && (
            <CloudSyncSection
              user={user}
              authLoading={authLoading}
              onSignIn={onSignIn}
              onSignOut={onSignOut}
              onImportLocalToAccount={onImportLocalToAccount}
              onClearLocalData={onClearLocalData}
            />
          )}

          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-ink">Storage location</p>
              <p className="text-xs text-ink-3 mt-0.5">
                {user ? 'Cloud Firestore (multi-device sync)' : 'This device only (localStorage)'}
              </p>
            </div>
            <span className="font-mono text-xs text-ink-3 self-start sm:self-auto">
              {user ? 'cloud sync' : 'local only'}
            </span>
          </div>
        </div>
      </section>

      {/* Models & AI */}
      <section className="space-y-2">
        <h2 className="text-xs font-medium text-ink-3">
          Intelligence
        </h2>
        <div className="border-t border-line divide-y divide-line">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-ink">Default reasoning model</p>
              <p className="text-xs text-ink-3 mt-0.5">
                Multi-turn grounded reasoning for radar and drawer.
              </p>
            </div>
            <span className="font-mono text-xs text-ink-3 self-start sm:self-auto">
              {DEFAULT_GEMINI_MODEL}
            </span>
          </div>

          <div className="py-2.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">Gemini API key (BYOK)</p>
                <p className="text-xs text-ink-3 mt-0.5">
                  Stored in browser memory only for this session.
                </p>
              </div>
              {savedNotice && (
                <span className="text-xs text-success font-medium self-start sm:self-auto">
                  Key saved
                </span>
              )}
            </div>

            {!canUseAi ? (
              <div className="py-2 text-xs text-ink-3">
                Sign in with Google to enable Ask AI.
              </div>
            ) : (
              <form onSubmit={handleSaveKey} className="flex gap-2 max-w-md pt-1">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 h-[32px] bg-surface border border-line-strong focus:border-ink rounded-md px-2.5 text-ink font-mono text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-[32px] px-3 rounded-md bg-surface hover:bg-hover border border-line-strong text-ink text-xs font-medium transition-colors shrink-0"
                >
                  Save
                </button>
                {userApiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="h-[32px] px-2.5 rounded-md text-ink-3 hover:text-urgency-hot text-xs transition-colors shrink-0"
                  >
                    Clear
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="space-y-2">
        <h2 className="text-xs font-medium text-ink-3">
          Data & Backups
        </h2>
        <div className="border-t border-line divide-y divide-line">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-medium text-ink">Workspace JSON backup</p>
              <p className="text-xs text-ink-3 mt-0.5">
                Export all opportunities and Arsenal projects, or restore a backup.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={onExportJson}
                className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-ink text-xs font-medium transition-colors"
              >
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {onClearLocalData && (
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">Reset local storage</p>
                <p className="text-xs text-ink-3 mt-0.5">
                  Clear local guest workspace data saved in this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear local guest workspace data from this browser?')) {
                    onClearLocalData();
                    setBackupMessage('Local guest workspace cleared.');
                  }
                }}
                className="h-[30px] px-3 rounded-md border border-line-strong bg-surface hover:bg-hover text-urgency-hot text-xs font-medium transition-colors self-start sm:self-auto"
              >
                Reset local
              </button>
            </div>
          )}
        </div>

        {backupMessage && (
          <div className="py-2 text-xs font-mono text-ink-2">
            {backupMessage}
          </div>
        )}
      </section>
    </div>
  );
}
