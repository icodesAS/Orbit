'use client';

import React, { useState, useRef } from 'react';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import { Key, ShieldCheck, Database, Cpu, Download, Upload, Lock } from 'lucide-react';
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
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleClearKey = () => {
    setTempKey('');
    onUpdateApiKey('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await onImportJson(text);
      setBackupMessage(`Imported ${res.oppsCount} opportunities and ${res.projsCount} projects from JSON.`);
    } catch (err: any) {
      setBackupMessage(`JSON import error: ${err?.message || 'Invalid JSON file'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-xs">
      <div className="pb-4 border-b border-[#E5E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#16181D]">
            Settings & <span className="font-serif italic font-normal text-[#4355B9]">Configuration</span>
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Manage account synchronization, JSON backups, and your session Gemini API key.
          </p>
        </div>
      </div>

      {/* Account & Cloud Sync */}
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

      {/* Mode Badge & Model Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-[#16181D] font-semibold">
            <Database className="w-4 h-4 text-[#4355B9]" />
            <span>Storage Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded border ${
                user
                  ? 'bg-[#ECFDF3] text-[#067647] border-[#D1FADF]'
                  : 'bg-[#F5F5F3] text-[#6B7280] border-[#E5E5E1]'
              }`}
            >
              {user ? 'Signed in (Firestore)' : 'Guest, saved on this device'}
            </span>
          </div>
          <p className="text-[#6B7280] text-[11px] leading-relaxed">
            {user
              ? 'Signed in with Google. Your pipeline, tasks, and Arsenal sync with Firestore.'
              : 'Saved on this device only (localStorage). Clearing browser data deletes it.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-[#16181D] font-semibold">
            <Cpu className="w-4 h-4 text-[#4355B9]" />
            <span>Default Gemini Model</span>
          </div>
          <div className="font-mono text-xs text-[#4355B9] font-medium">
            {DEFAULT_GEMINI_MODEL}
          </div>
          <p className="text-[#6B7280] text-[11px] leading-relaxed">
            Multi-turn reasoning with Google Search grounding. Configured via <code className="font-mono text-[#16181D]">GEMINI_MODEL</code> environment variable.
          </p>
        </div>
      </div>

      {/* BYOK Gemini API Key Form */}
      <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#16181D] font-semibold">
            <Key className="w-4 h-4 text-[#4355B9]" />
            <span>Gemini API Key (BYOK)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#067647] font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Browser Memory Only</span>
          </div>
        </div>

        <p className="text-[#6B7280] text-[11px] leading-relaxed">
          Your key stays in browser memory for this session only and is sent via request header. It is never written to localStorage, disk, or logs.
        </p>

        {!canUseAi ? (
          <div className="p-3 rounded-lg bg-[#F5F5F3] border border-[#E5E5E1] flex items-center justify-between gap-3 text-[#6B7280]">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Sign in to use Ask AI</span>
            </div>
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="px-3 py-1 rounded bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium text-xs transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveKey} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste your Gemini API key (AIzaSy...)"
                className="flex-1 bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-1.5 text-[#16181D] font-mono text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] text-white font-medium text-xs transition-colors shrink-0 shadow-2xs"
              >
                Set Key
              </button>
              {userApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#6B7280] text-xs transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
            {savedNotice && (
              <div className="font-mono text-[11px] text-[#067647]">
                Key updated in browser memory for this session.
              </div>
            )}
          </form>
        )}
      </div>

      {/* JSON Backup: Export JSON / Import JSON */}
      <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[#16181D] font-semibold">Workspace Backup (JSON)</h2>
            <p className="text-[#6B7280] text-[11px] mt-0.5">
              Export your opportunities and Arsenal projects to a JSON file, or import an existing backup.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#4355B9]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#4355B9]" />
              <span>Import JSON</span>
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
        {backupMessage && (
          <div className="p-2.5 rounded bg-[#F5F5F3] border border-[#E5E5E1] font-mono text-[11px] text-[#16181D]">
            {backupMessage}
          </div>
        )}
      </div>
    </div>
  );
}
