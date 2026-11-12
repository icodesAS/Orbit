'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import CloudSyncSection from './CloudSyncSection';

interface SettingsViewProps {
  userApiKey: string;
  onUpdateApiKey: (key: string) => void;
  isFirebaseReady: boolean;
  user?: any;
  authLoading?: boolean;
  opportunitiesCount?: number;
  projectsCount?: number;
  onSignIn?: () => Promise<any>;
  onSignOut?: () => Promise<void>;
  onImportLocalToAccount?: () => Promise<{ oppsCount: number; projsCount: number }>;
  onClearLocalData?: () => void;
  onResetGuestData?: () => void;
  onExportJson: () => void;
  onImportJson: (rawText: string) => Promise<{ oppsCount: number; projsCount: number }>;
}

export default function SettingsView({
  userApiKey, onUpdateApiKey, isFirebaseReady, user, authLoading = false,
  opportunitiesCount = 0, projectsCount = 0, onSignIn, onSignOut,
  onImportLocalToAccount, onClearLocalData, onResetGuestData,
  onExportJson, onImportJson,
}: SettingsViewProps) {
  const [tempKey, setTempKey] = useState(userApiKey);
  const [showKey, setShowKey] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGuest = !authLoading && !user;
  const canUseAi = Boolean(user) || !isFirebaseReady;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUseAi || !tempKey.trim()) return;
    onUpdateApiKey(tempKey.trim());
  };

  const handleClearKey = () => {
    setTempKey('');
    onUpdateApiKey('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await onImportJson(text);
      setBackupMessage(`Imported ${res.oppsCount} tracks and ${res.projsCount} projects.`);
    } catch (err: any) {
      setBackupMessage(`Error: ${err?.message || 'Invalid backup file'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmReset = () => {
    if (!isGuest) return;
    const resetFn = onResetGuestData || onClearLocalData;
    if (resetFn) {
      resetFn();
      setBackupMessage('Local guest workspace cleared.');
    }
    setConfirmResetOpen(false);
  };

  return (
    <div className="pt-10 px-8 max-w-[760px] mx-auto space-y-10 text-[13.5px]">
      <div className="pb-5 border-b border-line">
        <h1 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.022em] text-ink">Settings</h1>
        <p className="text-[13.5px] text-ink-2 mt-1">Workspace, account and intelligence configuration.</p>
      </div>

      {/* Account Section */}
      <section className="space-y-1">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 pb-2 border-b border-line">ACCOUNT</h2>
        <div className="divide-y divide-line-faint">
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

          <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-medium text-ink">Storage location</p>
              <p className="text-[13px] text-ink-3 mt-0.5">
                {user ? 'Cloud Firestore (multi-device sync)' : 'Saved in this browser only (localStorage)'}
              </p>
            </div>
            <span className="font-mono text-[12px] text-ink-3 self-start sm:self-auto">
              {user ? 'Cloud sync' : 'Local, this browser'}
            </span>
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="space-y-1">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 pb-2 border-b border-line">INTELLIGENCE</h2>
        <div className="divide-y divide-line-faint">
          <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-medium text-ink">Default reasoning model</p>
              <p className="text-[13px] text-ink-3 mt-0.5">Multi-turn grounded reasoning for radar and Ask AI drawer.</p>
            </div>
            <span className="font-mono text-[12px] text-ink-3 self-start sm:self-auto">{DEFAULT_GEMINI_MODEL}</span>
          </div>

          <div className="min-h-[64px] py-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[14px] font-medium text-ink">Gemini API key (BYOK)</p>
                <p className="text-[13px] text-ink-3 mt-0.5">Stored in browser memory only for this session.</p>
              </div>
              {Boolean(userApiKey) && <span className="chip chip-ok self-start sm:self-auto">Active for this session</span>}
            </div>

            {!canUseAi ? (
              <div className="text-[13px] text-ink-3">Sign in with Google to enable Ask AI.</div>
            ) : (
              <form onSubmit={handleSaveKey} className="flex items-center gap-2 max-w-[460px]">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    autoComplete="off"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="input pr-9 font-mono text-[12.5px]"
                  />
                  <button
                    type="button"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    onClick={() => setShowKey((prev) => !prev)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-icon"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5 text-ink-3" /> : <Eye className="w-3.5 h-3.5 text-ink-3" />}
                  </button>
                </div>
                <button type="submit" disabled={!tempKey.trim()} className="btn btn-secondary shrink-0">Save</button>
                {userApiKey && (
                  <button type="button" onClick={handleClearKey} className="btn btn-ghost shrink-0">Clear</button>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Data & Backups Section */}
      <section className="space-y-1">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 pb-2 border-b border-line">DATA & BACKUPS</h2>
        <div className="divide-y divide-line-faint">
          <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-medium text-ink">Workspace JSON backup</p>
              <p className="text-[13px] text-ink-3 mt-0.5">Export all opportunities and Arsenal projects, or restore a backup.</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button type="button" onClick={onExportJson} className="btn btn-secondary">Export JSON</button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Import JSON</button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} className="hidden" />
            </div>
          </div>

          {isGuest && (onResetGuestData || onClearLocalData) && (
            <div className="min-h-[64px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[14px] font-medium text-ink">Reset local storage</p>
                <p className="text-[13px] text-ink-3 mt-0.5">Permanently delete the workspace saved in this browser.</p>
              </div>
              <button type="button" onClick={() => setConfirmResetOpen(true)} className="btn btn-danger self-start sm:self-auto shrink-0">
                Reset local
              </button>
            </div>
          )}
        </div>

        {backupMessage && <div className="pt-2 font-mono text-[12px] text-ink-2">{backupMessage}</div>}
      </section>

      {isGuest && confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/24"
          onClick={() => setConfirmResetOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setConfirmResetOpen(false); } }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Reset local workspace?"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-[16px] bg-overlay border border-line shadow-[var(--shadow-modal)] overflow-hidden"
          >
            <div className="h-14 px-6 border-b border-line flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-ink">Reset local workspace?</h3>
              <button type="button" aria-label="Close dialog" onClick={() => setConfirmResetOpen(false)} className="btn btn-ghost btn-icon">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 text-[13.5px] text-ink-2 leading-relaxed">
              This permanently deletes {opportunitiesCount} track{opportunitiesCount === 1 ? '' : 's'} and {projectsCount} project{projectsCount === 1 ? '' : 's'} saved in this browser. Export a JSON backup first.
            </div>

            <div className="h-14 px-6 bg-raised border-t border-line flex items-center justify-between gap-2">
              <button type="button" onClick={onExportJson} className="btn btn-ghost btn-sm">Export backup</button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setConfirmResetOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="button" onClick={handleConfirmReset} className="btn btn-danger-solid">Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
