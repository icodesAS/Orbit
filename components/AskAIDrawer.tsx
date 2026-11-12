'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUp, RotateCcw, Lock, ListTodo, FileText } from 'lucide-react';
import type { User } from 'firebase/auth';
import { Opportunity, ArsenalProject, SubTask } from '@/lib/types';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import AskAIChatMessage from './AskAIChatMessage';
import AskAIActionChips from './AskAIActionChips';
import AskAIApplyPreview from './AskAIApplyPreview';
import { dur, ease, spring } from '@/lib/motion';

interface AskAIDrawerProps {
  opportunity: Opportunity | null;
  allProjects: ArsenalProject[];
  userApiKey?: string;
  firebaseUser?: User | null;
  canUseAi?: boolean;
  onSignIn?: () => Promise<any>;
  onClose: () => void;
  onSendMessage: (oppId: string, uText: string, aText: string, sources?: { title: string; uri: string }[]) => void;
  onClearHistory: (opportunityId: string) => void;
  onApplyTasks?: (tasks: SubTask[]) => void;
  onApplyCopy?: (copy: string) => void;
}

const SUGGESTION_PROMPTS = [
  'Draft a concise pitch angle using my linked Arsenal projects',
  'Verify eligibility criteria and key submission requirements',
  'Generate a step-by-step execution checklist for this deadline',
];

export default function AskAIDrawer({
  opportunity, allProjects, userApiKey, firebaseUser,
  canUseAi = false, onSignIn, onClose, onSendMessage, onClearHistory,
  onApplyTasks, onApplyCopy,
}: AskAIDrawerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ type: 'tasks' | 'copy'; rawText: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const oppId = opportunity?.id ?? null;
  const chatLength = opportunity?.aiChat.length ?? 0;

  useEffect(() => {
    if (oppId && canUseAi) textareaRef.current?.focus();
  }, [oppId, canUseAi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLength, isLoading]);

  if (!opportunity) return null;

  const linkedProjects = opportunity.projectIds
    .map((pid) => allProjects.find((p) => p.id === pid))
    .filter((p): p is ArsenalProject => Boolean(p));

  const handleSubmit = async (promptText: string) => {
    if (!canUseAi) return;
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setLastPrompt(trimmed);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) headers['X-Gemini-Key'] = userApiKey;
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (err) {
          console.error('Failed to get ID token:', err);
        }
      }

      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: trimmed,
          opportunity,
          linkedProjects,
          history: opportunity.aiChat,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate response');
      onSendMessage(opportunity.id, trimmed, data.text, data.sources);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach Gemini endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-40 bg-ink/24"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
      >
        <motion.aside
          key="ask-ai-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0, transition: spring.sheet }}
          exit={{ x: '100%', transition: { duration: 0.2, ease: ease.inOut } }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Ask AI"
          className="fixed inset-y-0 right-0 w-[calc(100vw-24px)] sm:w-[440px] bg-overlay border-l border-line shadow-[var(--shadow-modal)] flex flex-col select-none"
        >
          <div className="h-12 px-4 border-b border-line flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[14px] font-semibold text-ink shrink-0">Ask AI</span>
              <span className="chip truncate max-w-[160px]" title={opportunity.title}>{opportunity.title}</span>
              <span className="font-mono text-[11px] text-ink-3 hidden sm:inline shrink-0">{DEFAULT_GEMINI_MODEL}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {canUseAi && opportunity.aiChat.length > 0 && (
                <button
                  type="button"
                  onClick={() => onClearHistory(opportunity.id)}
                  title="Clear chat history"
                  aria-label="Clear chat history"
                  className="btn btn-ghost btn-icon"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                title="Close drawer (Esc)"
                aria-label="Close drawer (Esc)"
                className="btn btn-ghost btn-icon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!canUseAi ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-sunken border border-line flex items-center justify-center text-ink-3">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-[14px] font-medium text-ink">Sign in to use Ask AI</p>
              <p className="text-[13px] text-ink-3 max-w-xs leading-relaxed">
                Sign in with Google and add your Gemini key in Settings to use scoped AI assistance.
              </p>
              {onSignIn && (
                <button type="button" onClick={onSignIn} className="btn btn-primary">
                  Sign in with Google
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {opportunity.aiChat.length === 0 ? (
                  <div className="space-y-3 pt-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">SUGGESTED PROMPTS</p>
                    <div className="divide-y divide-line border-y border-line">
                      {SUGGESTION_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleSubmit(prompt)}
                          className="w-full py-2.5 px-2 text-left text-[13.5px] text-ink-2 hover:text-ink hover:bg-hover transition-colors flex items-center justify-between gap-2"
                        >
                          <span>{prompt}</span>
                          <span className="font-mono text-[11px] text-ink-3 shrink-0">↵</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  opportunity.aiChat.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } }}
                      className="space-y-1"
                    >
                      <AskAIChatMessage message={msg} />
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 pt-0.5 pl-1">
                          {onApplyTasks && (msg.content.includes('- [') || msg.content.includes('* [')) && (
                            <button
                              type="button"
                              onClick={() => setPreviewState({ type: 'tasks', rawText: msg.content })}
                              className="text-[11px] font-mono text-ink-3 hover:text-ink flex items-center gap-1 transition-colors"
                            >
                              <ListTodo className="w-3 h-3" />
                              <span>Apply to checklist</span>
                            </button>
                          )}
                          {onApplyCopy && msg.content.length > 50 && (
                            <button
                              type="button"
                              onClick={() => setPreviewState({ type: 'copy', rawText: msg.content })}
                              className="text-[11px] font-mono text-ink-3 hover:text-ink flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Apply to copy</span>
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}

                {previewState && (
                  <AskAIApplyPreview
                    type={previewState.type}
                    rawText={previewState.rawText}
                    existingCopy={opportunity.applicationCopy}
                    onApplyTasks={(tasks) => onApplyTasks?.(tasks)}
                    onApplyCopy={(copy) => onApplyCopy?.(copy)}
                    onClose={() => setPreviewState(null)}
                  />
                )}

                {isLoading && (
                  <div className="flex items-center gap-1.5 py-2 px-1" aria-label="Generating response">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-pulse [animation-delay:200ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-pulse [animation-delay:400ms]" />
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded-[8px] px-3 py-2 bg-bad-soft text-[13px] text-bad flex items-center justify-between gap-2">
                    <span>{errorMsg}</span>
                    {lastPrompt && (
                      <button type="button" onClick={() => handleSubmit(lastPrompt)} className="btn btn-ghost btn-sm shrink-0">
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="p-3 border-t border-line bg-overlay shrink-0 space-y-2">
                <AskAIActionChips
                  onSelectChip={handleSubmit}
                  disabled={isLoading}
                  hasLinkedProjects={linkedProjects.length > 0}
                />
                <div className="relative rounded-[12px] border border-line-strong bg-overlay focus-within:border-accent/55 focus-within:ring-3 focus-within:ring-accent-ring transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(input);
                      }
                    }}
                    placeholder="Ask about this opportunity..."
                    className="w-full px-3 pt-2.5 pb-9 bg-transparent text-[14px] text-ink placeholder:text-ink-4 focus:outline-none resize-none"
                  />
                  <div className="absolute bottom-2 left-3 right-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink-3">
                      <span className="kbd mr-1">↵</span>send · Shift+↵ newline
                    </span>
                    <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message" className="btn btn-primary btn-icon">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}
