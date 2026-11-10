'use client';

import React, { useState } from 'react';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import { Key, RotateCcw, ShieldCheck, Database, Cpu } from 'lucide-react';

interface SettingsViewProps {
  userApiKey: string;
  onUpdateApiKey: (key: string) => void;
  isLive: boolean;
  onResetDemo: () => void;
}

export default function SettingsView({
  userApiKey,
  onUpdateApiKey,
  isLive,
  onResetDemo,
}: SettingsViewProps) {
  const [tempKey, setTempKey] = useState(userApiKey);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-xs">
      <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">
            Settings & Model Configuration
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Bring Your Own Key (BYOK) for Gemini AI. Keys stay in browser memory only.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs whitespace-nowrap shrink-0 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* Mode Badge & Storage Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded bg-[#0e0e12] border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Persistence Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded border ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isLive ? 'LIVE FIRESTORE' : 'LOCAL DEMO (localStorage)'}
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            {isLive
              ? 'Connected to Firebase. Data is synced to Firestore under your user identity.'
              : 'Zero Firebase credentials detected. Using fictional SAMPLE dataset stored in your browser.'}
          </p>
        </div>

        <div className="p-4 rounded bg-[#0e0e12] border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Default Gemini Model</span>
          </div>
          <div className="font-mono text-xs text-blue-300">
            {DEFAULT_GEMINI_MODEL}
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Fast, multi-turn reasoning with Google Search grounding. Configured via <code className="font-mono text-zinc-200">GEMINI_MODEL</code> environment variable.
          </p>
        </div>
      </div>

      {/* BYOK Gemini API Key Form */}
      <div className="p-4 rounded bg-[#0e0e12] border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Key className="w-4 h-4 text-blue-400" />
            <span>Gemini API Key (BYOK)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Browser Memory Only</span>
          </div>
        </div>

        <p className="text-zinc-400 text-[11px] leading-relaxed">
          Order of precedence: <strong>1)</strong> User memory key pasted below, <strong>2)</strong> Server <code className="font-mono text-zinc-300">GEMINI_API_KEY</code>, <strong>3)</strong> Demo fallback.
          Your key is never written to localStorage, disk, or logs.
        </p>

        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="flex-1 bg-[#0a0a0d] border border-zinc-800 focus:border-blue-500 rounded px-3 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shrink-0"
            >
              Set Key
            </button>
            {userApiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>
          {savedNotice && (
            <div className="font-mono text-[11px] text-emerald-400">
              Key updated in browser memory for this session.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
