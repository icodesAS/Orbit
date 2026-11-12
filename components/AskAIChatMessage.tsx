'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AIChatMessage } from '@/lib/types';
import { isValidHttpsUrl } from '@/lib/url';

interface AskAIChatMessageProps {
  message: AIChatMessage;
}

export default function AskAIChatMessage({ message }: AskAIChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] rounded-[12px] bg-sunken px-3.5 py-2 text-[14px] leading-[1.5] text-ink whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="text-[14px] leading-[1.6] text-ink-2 whitespace-pre-wrap">
        {message.content}
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {message.sources
            .filter((src) => isValidHttpsUrl(src.uri))
            .map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="chip !h-[22px] hover:border-line-strong transition-colors"
              >
                <span className="truncate max-w-[200px]">{src.title}</span>
                <ExternalLink className="w-3 h-3 text-ink-3 shrink-0" />
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
