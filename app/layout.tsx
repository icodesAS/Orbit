import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Orbit — Personal Opportunity Pipeline & Radar',
  description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Orbit — Personal Opportunity Pipeline & Radar',
    description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbit — Personal Opportunity Pipeline & Radar',
    description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-canvas text-ink antialiased selection:bg-selected selection:text-ink font-sans overflow-hidden text-[13px]"
      >
        {children}
      </body>
    </html>
  );
}
