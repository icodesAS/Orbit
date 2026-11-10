# Orbit — Design System & Interaction Model
SUPERSEDED for colors, theme, and layout by 07_UI_REDESIGN.md. Keep only the interaction rules (shortcuts, undo, command palette).
## Visual Language

- Theme: Tactical dark mode (near-black backgrounds #0a0a0b – #111113, high-contrast text)
- Accent: Used sparingly — electric blue or soft violet only for interactive elements and focus states
- Typography:
  - JetBrains Mono → deadlines, progress numbers, IDs, status, project names
  - Clean sans (Inter or system) → body text and labels
- Spacing: Extremely tight. Hairline separators. Minimal borders. Generous group spacing only.
- Elevation: Subtle. Prefer 1px hairlines and background shifts over heavy shadows.

## Interaction Model (Locked)

### Command Palette

- Trigger: ⌘K / Ctrl+K or clicking the top search bar
- Primary way to perform any action
- Supports: create, jump to, change status, link project, open Ask AI, filter

### Keyboard Shortcuts (always visible next to actions)

- N — New opportunity
- J / K — Navigate up/down
- E — Edit focused item
- A — Open Ask AI
- S — Advance status
- P — Link project from Arsenal
- Esc — Close palette / drawer

### Optimistic Updates

- UI updates instantly on every status change, sub-task toggle, or archive
- Firestore write happens in background
- On failure: silent revert + error toast

### Undo Toast

- Appears for 5 seconds after archive, delete, or major status change
- No confirmation dialogs for these actions

### Deadline Heat System

- 7 days → calm grey chip
- ≤ 3 days → amber chip
- ≤ 24 hours → red chip + slow pulse
- Relative + absolute time shown

### Motion

- Framer Motion springs
- Maximum duration ~250ms
- Respect prefers-reduced-motion

## Layout (Desktop)

- Left sidebar: Icon-only (56–64px), expands on hover
- Items: Pipeline (default), Radar, Arsenal, Settings
- Top bar: Search trigger (opens palette) + date + next-deadline summary + notification indicator
- Main content:
  - Pinned Today strip at top (“Due in next 72 hours” + unreviewed morning radar)
  - Default view: Structured list grouped by the three tiers, sorted by soonest deadline
  - Toggle available for Board (Kanban) view

## Card Anatomy (Dense)

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
- Today = home screen (urgent + morning radar)
- Pipeline uses top tabs for the three tiers
- Cards and Ask AI open as bottom sheets
- Swipe right = advance status
- Swipe left = snooze / archive
- Only two notification types at launch:
  - New opportunities (morning radar)
  - Deadline in 24 hours
