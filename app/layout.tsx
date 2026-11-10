import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, EB_Garamond } from 'next/font/google';
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

const serif = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
  description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
  openGraph: {
    title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
    description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
    description: 'Calm, keyboard-first opportunity pipeline and radar for builders.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-[#F5F5F3] text-[#16181D] antialiased selection:bg-[#4355B9]/15 selection:text-[#4355B9] font-sans overflow-hidden text-sm"
      >
        {children}
      </body>
    </html>
  );
}
