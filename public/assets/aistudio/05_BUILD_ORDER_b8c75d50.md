# Orbit — Locked Build Order

## Demo Mode Foundation

- Local fake data
- Structured list view
- Card component
- Today strip
- Basic dark theme + JetBrains Mono

## Command System

- Command Palette (⌘K)
- Single-key shortcuts
- Optimistic updates + Undo toast

## Real Data Layer

- Firebase Auth
- Firestore structure
- Security rules
- Migration path from Demo → Live

## 9:00 AM Radar

- GitHub Actions cron (30 3 * * *)
- 4 separate Gemini calls in parallel (one per priority tier), each independent, no shared chat history
- each returns strict JSON only
- project context comes from the contextBlurb of each Arsenal project
- send the last 14 days of urlHash to avoid repeats
- write the immutable radarDays/{date} with admin credentials
- Source link + Verify badge in the UI

## Ask AI Drawer

- Right slide-over / bottom sheet
- Scoped context (opportunity + linked projects)
- Isolated aiChat subcollection
- Search grounding

## Project Arsenal

- CRUD for flagship projects
- Linking from opportunity cards
- Bidirectional usedInCount

## Board View Toggle

- Kanban columns for the three tiers
- Drag-and-drop with sortOrder

## Mobile & PWA

- Bottom tab navigation
- Bottom sheets
- Swipe actions
- FCM setup (morning radar + 24h deadline)
- Add-to-Home-Screen guidance

## Polish & Open-Source Hardening

- Reduced motion support
- Empty states
- README with Demo / BYOK instructions
- Cost warnings
- Final security review
