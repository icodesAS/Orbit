import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
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
  title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
  description: 'High-density, keyboard-first pipeline management and opportunity radar for AI engineers and builders.',
  openGraph: {
    title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
    description: 'High-density, keyboard-first pipeline management and opportunity radar for AI engineers and builders.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orbit — Autonomous Opportunity & Pipeline Command Center',
    description: 'High-density, keyboard-first pipeline management and opportunity radar for AI engineers and builders.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark`}>
      <body
        suppressHydrationWarning
        className="bg-[#0a0a0b] text-zinc-100 antialiased selection:bg-blue-500/30 selection:text-blue-200 font-sans overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
