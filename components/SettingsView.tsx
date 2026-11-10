'use client';

import React, { useState } from 'react';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import { Key, RotateCcw, ShieldCheck, Database, Cpu, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  userApiKey: string;
  onUpdateApiKey: (key: string) => void;
  isLive: boolean;
  hasSampleData: boolean;
  onLoadSampleData: () => void;
  onRemoveSampleData: () => void;
  onResetDemo?: () => void;
}

export default function SettingsView({
  userApiKey,
  onUpdateApiKey,
  isLive,
  hasSampleData,
  onLoadSampleData,
  onRemoveSampleData,
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
      <div className="pb-4 border-b border-[#E5E5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#16181D]">
            Settings & <span className="font-serif italic font-normal text-[#4355B9]">Configuration</span>
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Bring Your Own Key (BYOK) for Gemini AI. Keys stay in browser memory only.
          </p>
        </div>

        {!isLive && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D] font-mono text-xs whitespace-nowrap shrink-0 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Load sample data</span>
            </button>
            {hasSampleData && (
              <button
                type="button"
                onClick={onRemoveSampleData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF0C7] hover:bg-[#FEE4E2] border border-[#FEDF89] text-[#B54708] font-mono text-xs whitespace-nowrap shrink-0 transition-colors shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#B54708]" />
                <span>Remove sample data</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mode Badge & Storage Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#E5E5E1] space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-[#16181D] font-semibold">
            <Database className="w-4 h-4 text-[#B54708]" />
            <span>Persistence Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded border ${
                isLive
                  ? 'bg-[#ECFDF3] text-[#067647] border-[#D1FADF]'
                  : 'bg-[#FEF0C7] text-[#B54708] border-[#FEDF89]'
              }`}
            >
              {isLive ? 'LIVE FIRESTORE' : 'LOCAL DEMO (localStorage)'}
            </span>
          </div>
          <p className="text-[#6B7280] text-[11px] leading-relaxed">
            {isLive
              ? 'Connected to Firebase. Data is synced to Firestore under your user identity.'
              : hasSampleData
              ? 'Using fictional SAMPLE dataset stored in your browser localStorage.'
              : 'Workspace data is saved to your browser localStorage.'}
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
            Fast, multi-turn reasoning with Google Search grounding. Configured via <code className="font-mono text-[#16181D]">GEMINI_MODEL</code> environment variable.
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
          Order of precedence: <strong>1)</strong> User memory key pasted below, <strong>2)</strong> Server <code className="font-mono text-[#16181D]">GEMINI_API_KEY</code>, <strong>3)</strong> Demo fallback.
          Your key is never written to localStorage, disk, or logs.
        </p>

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
      </div>
    </div>
  );
}
