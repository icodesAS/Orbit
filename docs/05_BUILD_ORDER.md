# Orbit — Locked Build Order

Board view, PWA/FCM, and the GitHub Actions radar job are later. Not this pass.

## Demo Mode Foundation

- SAMPLE demo data in /demo/demoData.ts only
- Today as home
- Pipeline as table rows in three tiers
- Light theme (docs/07_UI_REDESIGN.md)
- Inter + JetBrains Mono for dates, numbers, IDs

## Command System

- Command Palette (⌘K / Ctrl+K)
- Single-key shortcuts (N, J/K, E edit, Enter/Space expand, P project picker, A, S, Esc)
- Optimistic updates + Undo toast

## Real Data Layer

- Demo vs Live: Live only if Firebase env vars exist, else Demo
- Demo: localStorage
- Live: Firebase Auth + Firestore
- firestore.rules at repo root
- Migration path from Demo → Live

## 9:00 AM Radar (job later; UI this pass)

- UI: dated digest, local timezone, headings 1A, 1B, 1C, 2
- 1A campus ambassador/lead roles
- 1B residencies/fellowships/research
- 1C hackathons/internships
- 2 free credits/perks
- Source link; Mark verified only after source was opened
- Track anytime with deadline-confirm form
- Later job: GitHub Actions cron (30 3 * * *) on the user's fork
- Later job: 4 separate Gemini calls in parallel (one per priority), each independent, no shared chat history
- Later job: each returns strict JSON only
- Later job: project context from contextBlurb of each Arsenal project
- Later job: send the last 14 days of urlHash to avoid repeats
- Later job: write immutable radarDays/{date} with admin credentials

## Ask AI Drawer

- Right slide-over / bottom sheet
- Scoped context (opportunity + linked projects)
- Isolated aiChat subcollection
- Search grounding
- Key from Settings (memory only), then server env, then demo fallback

## Project Arsenal

- CRUD for flagship projects (user-added)
- Linking from pipeline rows via project picker (P)
- Bidirectional usedInCount

## Board View Toggle

- Later. Kanban columns for the three tiers
- Later. Drag-and-drop with sortOrder

## Mobile

- Bottom tabs: Today | Pipeline | Radar | Arsenal
- Settings in menu
- Bottom sheets
- Swipe actions
- Later: PWA, FCM (morning radar + 24h deadline), Add-to-Home-Screen guidance

## Polish & Open-Source Hardening

- Reduced motion support
- Empty states: one plain sentence and one button
- README with Demo / BYOK instructions
- Cost warnings
- Final security review
