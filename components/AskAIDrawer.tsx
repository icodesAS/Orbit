'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Opportunity, ArsenalProject } from '@/lib/types';
import { getDeadlineInfo } from '@/lib/deadline';
import AskAIChatMessage from './AskAIChatMessage';
import {
  X,
  Sparkles,
  Send,
  FolderGit2,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface AskAIDrawerProps {
  opportunity: Opportunity | null;
  allProjects: ArsenalProject[];
  userApiKey?: string;
  onClose: () => void;
  onSendMessage: (
    opportunityId: string,
    userText: string,
    assistantText: string,
    sources?: { title: string; uri: string }[]
  ) => void;
  onClearHistory: (opportunityId: string) => void;
}

const TACTICAL_PROMPTS = [
  'Draft an application abstract tailored to linked projects',
  'Review eligibility criteria & identify potential blockers',
  'Generate a final submission verification checklist',
];

export default function AskAIDrawer({
  opportunity,
  allProjects,
  userApiKey,
  onClose,
  onSendMessage,
  onClearHistory,
}: AskAIDrawerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const oppId = opportunity?.id ?? null;
  const chatLength = opportunity?.aiChat.length ?? 0;

  useEffect(() => {
    if (oppId) {
      inputRef.current?.focus();
    }
  }, [oppId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLength, isLoading]);

  if (!opportunity) return null;

  const linkedProjects = opportunity.projectIds
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter((p): p is ArsenalProject => Boolean(p));

  const deadlineInfo = getDeadlineInfo(opportunity.deadline, opportunity.status);

  const handleSubmit = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          opportunity,
          linkedProjects,
          history: opportunity.aiChat,
          userKey: userApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      onSendMessage(opportunity.id, trimmed, data.text, data.sources);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to reach Gemini endpoint';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        key="ask-ai-drawer"
        initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
        transition={
          prefersReducedMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 400, damping: 36, mass: 0.8 }
        }
        aria-label="Scoped Ask AI Drawer"
        className="fixed inset-y-0 right-0 w-full md:w-[42%] lg:w-[40%] max-w-2xl bg-[#0c0c0f] border-l border-zinc-800 shadow-2xl z-40 flex flex-col"
      >
        <div className="px-5 py-3.5 border-b border-zinc-800/90 flex items-center justify-between gap-3 bg-[#101014]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-100">
                  Scoped Ask AI
                </span>
                <span className="font-mono text-[11px] text-blue-400 tabular-nums">
                  {opportunity.code}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Isolated to {opportunity.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {opportunity.aiChat.length > 0 && (
              <button
                type="button"
                onClick={() => onClearHistory(opportunity.id)}
                title="Reset opportunity chat history"
                className="px-2 py-1 rounded text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="px-2 py-1 rounded text-xs font-mono text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 flex items-center gap-1 transition-colors"
            >
              <span>Esc</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#0e0e12] border-b border-zinc-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-zinc-200 truncate">
              {opportunity.organization} — {opportunity.title}
            </span>
            <span className="font-mono text-[11px] text-zinc-400 tabular-nums shrink-0">
              {deadlineInfo.relativeLabel} · {opportunity.tasksDone}/{opportunity.tasksTotal} tasks
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1">
              <FolderGit2 className="w-3 h-3 text-blue-400" />
              Arsenal Context:
            </span>
            {linkedProjects.length > 0 ? (
              linkedProjects.map((p) => (
                <span
                  key={p.id}
                  className="font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded"
                >
                  {p.title}
                </span>
              ))
            ) : (
              <span className="font-mono text-zinc-500">No Arsenal projects linked</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {opportunity.aiChat.length === 0 ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                <p className="font-medium text-zinc-100 mb-1">
                  Context-isolated AI advisor for {opportunity.code}
                </p>
                <p className="text-zinc-400">
                  This conversation is strictly scoped to this opportunity and its linked Arsenal projects. Messages stay private to this document.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-zinc-500">
                  Quick Prompts
                </div>
                {TACTICAL_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSubmit(prompt)}
                    className="w-full text-left px-3 py-2 rounded bg-[#121216] hover:bg-zinc-800/80 border border-zinc-800/80 text-xs text-zinc-300 hover:text-white transition-colors flex items-center justify-between gap-2 group"
                  >
                    <span>{prompt}</span>
                    <Send className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            opportunity.aiChat.map((msg) => (
              <AskAIChatMessage key={msg.id} message={msg} />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-[#131318] border border-zinc-800 rounded px-3.5 py-2.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating response for {opportunity.code}...</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded px-3 py-2 bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
          className="p-3.5 border-t border-zinc-800 bg-[#101014]"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${opportunity.title}...`}
              className="flex-1 bg-[#0a0a0c] border border-zinc-800 focus:border-blue-500 rounded px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-medium text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </motion.aside>
    </AnimatePresence>
  );
}
