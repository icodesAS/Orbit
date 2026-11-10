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
        className="fixed inset-y-0 right-0 w-full md:w-[42%] lg:w-[40%] max-w-2xl bg-white border-l border-[#E5E5E1] shadow-2xl z-40 flex flex-col select-none"
      >
        <div className="px-5 py-3.5 border-b border-[#E5E5E1] flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-[#4355B9]/10 border border-[#4355B9]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#4355B9]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#16181D]">
                  Scoped Ask AI
                </span>
                <span className="font-mono text-[11px] text-[#4355B9] tabular-nums font-medium">
                  {opportunity.code}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate">
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
                className="px-2 py-1 rounded text-[11px] font-mono text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="px-2 py-1 rounded text-xs font-mono text-[#6B7280] hover:text-[#16181D] hover:bg-[#F5F5F3] flex items-center gap-1 transition-colors"
            >
              <span>Esc</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#F5F5F3] border-b border-[#E5E5E1] space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#16181D] truncate">
              {opportunity.organization} — {opportunity.title}
            </span>
            <span className="font-mono text-[11px] text-[#6B7280] tabular-nums shrink-0">
              {deadlineInfo.relativeLabel} · {opportunity.tasksDone}/{opportunity.tasksTotal} tasks
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[#6B7280] flex items-center gap-1">
              <FolderGit2 className="w-3 h-3 text-[#4355B9]" />
              Arsenal Context:
            </span>
            {linkedProjects.length > 0 ? (
              linkedProjects.map((p) => (
                <span
                  key={p.id}
                  className="font-mono text-[#4355B9] bg-[#4355B9]/10 border border-[#4355B9]/20 px-1.5 py-0.5 rounded font-medium"
                >
                  {p.title}
                </span>
              ))
            ) : (
              <span className="font-mono text-[#6B7280]">No Arsenal projects linked</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {opportunity.aiChat.length === 0 ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#F5F5F3] border border-[#E5E5E1] text-xs text-[#16181D] leading-relaxed shadow-2xs">
                <p className="font-semibold text-[#16181D] mb-1">
                  Context-isolated AI advisor for {opportunity.code}
                </p>
                <p className="text-[#6B7280]">
                  This conversation is strictly scoped to this opportunity and its linked Arsenal projects. Messages stay private to this document.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-[#6B7280]">
                  Quick Prompts
                </div>
                {TACTICAL_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSubmit(prompt)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-[#F5F5F3] border border-[#E5E5E1] text-xs text-[#16181D] transition-colors flex items-center justify-between gap-2 group shadow-2xs"
                  >
                    <span>{prompt}</span>
                    <Send className="w-3 h-3 text-[#6B7280] group-hover:text-[#4355B9] shrink-0" />
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
            <div className="flex items-center gap-2 text-xs font-mono text-[#4355B9] bg-[#F5F5F3] border border-[#E5E5E1] rounded px-3.5 py-2.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating response for {opportunity.code}...</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded px-3 py-2 bg-[#FEE4E2] border border-[#FECDCA] text-xs text-[#D92D20]">
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
          className="p-3.5 border-t border-[#E5E5E1] bg-white"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${opportunity.title}...`}
              className="flex-1 bg-[#F5F5F3] border border-[#E5E5E1] focus:bg-white focus:border-[#4355B9] rounded px-3 py-2 text-xs text-[#16181D] placeholder:text-[#6B7280] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-2 rounded-lg bg-[#4355B9] hover:bg-[#3848A3] disabled:opacity-40 text-xs font-medium text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
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
