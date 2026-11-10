# Orbit

**Autonomous Opportunity & Pipeline Command Center**

Orbit is a calm, keyboard-first dashboard for tracking application pipelines (hackathons, campus ambassador roles, fellowships, residencies, and waitlists) and reviewing daily opportunity digests.

---

## Core Features

- **Today (Home)**: Focuses on items due within 72 hours and provides a direct link to the morning radar digest.
- **Pipeline (3 Operational Tiers)**:
  - *Active Builds & Submissions* — Hard deadlines, sub-tasks, progress counters, and linked Arsenal projects.
  - *Waitlists & Registration Watch* — Closed or upcoming programs to monitor.
  - *Submitted / Pending Verdict* — Completed applications with preserved essays and links.
- **Morning Radar Digest**: Read-only daily feed grouped into 4 priority tiers:
  - `1A` — Campus ambassador & lead roles
  - `1B` — Residencies, fellowships & research
  - `1C` — Hackathons & internships
  - `2` — Free credits & developer perks
  - *Verification & Tracking*: Items start unverified. Open the source link first to enable **Mark verified**, or click **Track** to confirm the deadline and copy an item into your Pipeline.
- **Project Arsenal**: Manage flagship projects and link them to pipeline opportunities (`P` shortcut).
- **Scoped Ask AI Drawer**: Per-opportunity assistant scoped strictly to the focused opportunity and its linked Arsenal projects.
- **Keyboard-First Workflow**: Command palette (`Ctrl+K` / `⌘K`), `N` (new), `J`/`K` (navigate), `E` (edit), `Enter`/`Space` (expand), `P` (project picker), `A` (Ask AI), `S` (advance status), `Esc` (close), plus 5-second undo toasts.

---

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling & Motion**: Tailwind CSS + Framer Motion (light theme, reduced-motion aware)
- **Persistence**:
  - **Demo Mode (Default)**: Runs out of the box using `localStorage` and fictional `SAMPLE` data in `/demo/demoData.ts`.
  - **Live Mode**: Activates automatically when `NEXT_PUBLIC_FIREBASE_*` environment variables are configured, using Firebase Auth and Cloud Firestore.
- **AI**: Google Gemini API (`@google/genai`) with Google Search grounding.

---

## Getting Started

### Prerequisites
- Node.js 20+ and `npm`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Demo Mode (Zero Config)
Orbit works immediately in **Demo Mode** without any API keys or Firebase setup:
```bash
npm run dev
```
Open `http://localhost:3000`. All changes persist locally in your browser's `localStorage`, and you can reset back to default `SAMPLE` data anytime in **Settings**.

### 3. Bring Your Own Key (BYOK) for Ask AI
You can use the Ask AI drawer in three ways (checked in this order):
1. **Browser Memory Key (Recommended for quick local/demo use)**: Paste your Gemini API key in **Settings**. It is kept in browser memory only (never saved to `localStorage` or logged) and sent per request.
2. **Server Environment Variable**: Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
3. **Demo Fallback**: If no key is provided, Ask AI returns a deterministic sample response.

### 4. Live Mode (Optional Firebase Setup)
To enable Live Mode with Firestore:
1. Copy `.env.example` to `.env.local` and fill in your `NEXT_PUBLIC_FIREBASE_*` credentials.
2. Deploy the security rules from the repository root [`firestore.rules`](./firestore.rules) to your Firebase project.

---

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint
