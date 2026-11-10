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
      <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-[#6B7280]">
        <span>{isUser ? 'BUILDER' : 'ORBIT AI'}</span>
        <span>·</span>
        <span>{message.createdAt}</span>
      </div>
      <div
        className={`max-w-[92%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#4355B9]/10 border border-[#4355B9]/25 text-[#16181D]'
            : 'bg-[#F5F5F3] border border-[#E5E5E1] text-[#16181D]'
        }`}
      >
        {message.content}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#E5E5E1] space-y-1">
            <div className="text-[10px] font-mono text-[#6B7280] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#067647]" />
              <span>Search Grounding Sources:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4355B9] hover:underline"
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
