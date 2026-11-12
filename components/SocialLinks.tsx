import React from 'react';
import { Github, Linkedin, Youtube } from 'lucide-react';

interface SocialLinksProps {
  className?: string;
  size?: 'sm' | 'md';
}

function XIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export const SOCIAL_PROFILES = [
  {
    name: 'GitHub',
    handle: '@icodesAS',
    url: 'https://github.com/icodesAS',
    icon: Github,
  },
  {
    name: 'X (Twitter)',
    handle: '@icodesAS',
    url: 'https://x.com/icodesAS',
    icon: XIcon,
  },
  {
    name: 'LinkedIn',
    handle: 'amans18',
    url: 'https://www.linkedin.com/in/amans18',
    icon: Linkedin,
  },
  {
    name: 'YouTube',
    handle: '@icodesas',
    url: 'https://youtube.com/@icodesas',
    icon: Youtube,
  },
];

export function SocialLinks({ className = '', size = 'md' }: SocialLinksProps) {
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {SOCIAL_PROFILES.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${item.name} (${item.handle})`}
            title={`${item.name} (${item.handle})`}
            className={`${btnSize} rounded-[8px] bg-sunken hover:bg-hover border border-line hover:border-line-strong text-ink-3 hover:text-ink transition-all flex items-center justify-center`}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
