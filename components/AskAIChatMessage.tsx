'use client';

import React from 'react';
import { AIChatMessage } from '@/lib/types';
import { CheckCircle2, ExternalLink } from 'lucide-react';

interface AskAIChatMessageProps {
  message: AIChatMessage;
}

export default function AskAIChatMessage({ message }: AskAIChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-zinc-500">
        <span>{isUser ? 'BUILDER' : 'ORBIT AI'}</span>
        <span>·</span>
        <span>{message.createdAt}</span>
      </div>
      <div
        className={`max-w-[92%] rounded px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600/20 border border-blue-500/30 text-zinc-100'
            : 'bg-[#131318] border border-zinc-800 text-zinc-200'
        }`}
      >
        {message.content}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Search Grounding Sources:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[200px]">{src.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
