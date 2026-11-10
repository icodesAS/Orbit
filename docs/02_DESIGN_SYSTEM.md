# Orbit — Design System & Interaction Model

Visual language, colors, type, layout, and motion: follow docs/07_UI_REDESIGN.md and AGENTS.md. This file keeps interaction rules.

## Visual Language

See docs/07_UI_REDESIGN.md. Light theme. No glow, gradients, glass, neon, or pulse.

## Interaction Model (Locked)

### Command Palette

- Trigger: ⌘K / Ctrl+K or clicking the top search bar
- Primary way to perform any action
- Supports: create, jump to, change status, link project, open Ask AI, filter

### Keyboard Shortcuts (always visible next to actions)

- N — New opportunity
- J / K — Navigate up/down
- E — Edit focused item
- Enter / Space — Expand focused item
- A — Open Ask AI
- S — Advance status
- P — Open project picker
- Esc — Close palette / drawer / form

### Optimistic Updates

- UI updates instantly on every status change, sub-task toggle, or archive
- Demo: persist to localStorage in the background
- Live: Firestore write happens in the background
- On failure: silent revert + error toast

### Undo Toast

- Appears for 5 seconds after archive, delete, or major status change
- No confirmation dialogs for these actions
- Track still uses a small deadline-confirm form (not a destructive confirm)

### Deadline Heat System

- Grey: more than 3 days
- Amber: 3 days or less
- Red: 24 hours or less
- Soft tinted chips, no pulse
- The red chip may have one small static dot
- Relative + absolute time shown, in the user's local timezone

### Motion

- 150–200ms fades only
- Respect prefers-reduced-motion

## Layout (Desktop)

- Left sidebar: labelled (icon + text), 220px, collapsible
- Items: Today (home), Pipeline, Radar, Arsenal. Settings in a menu.
- Top bar: Search trigger (opens palette) + date + next-deadline summary + notification indicator
- Home (Today): "Due soon" list, then a link to this morning's digest count
- Pipeline: clean table rows grouped by the three tiers, sorted by soonest deadline
- Board (Kanban) view: later. Do not build in this pass.

## Table Row Anatomy (Pipeline)

- Title + type badge
- Deadline heat chip + relative time
- Thin progress bar + tasksDone / tasksTotal
- Linked Project Arsenal pills
- Status chip + last activity timestamp
- Hover/focus reveals: Ask AI, Link Project, Advance Status

## Ask AI Drawer

- Slides from right (~40% width on desktop)
- Strictly scoped to the current opportunity + linked projects
- Chat history stored only inside the opportunity document
- Never pollutes radar history

## Mobile (Triage-First)

- Bottom tabs: Today | Pipeline | Radar | Arsenal
- Settings in a menu, not a tab
- Today = home screen (due soon + morning digest link)
- Pipeline uses top tabs or grouped sections for the three tiers
- Cards and Ask AI open as bottom sheets
- Swipe right = advance status
- Swipe left = snooze / archive
- Only two notification types at launch:
  - New opportunities (morning radar)
  - Deadline in 24 hours
