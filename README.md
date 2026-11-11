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
- **Scoped Ask AI Drawer**: Per-opportunity assistant scoped strictly to the focused opportunity and its linked Arsenal projects (requires sign-in).
- **Keyboard-First Workflow**: Command palette (`Ctrl+K` / `⌘K`), `N` (new), `J`/`K` (navigate), `E` (edit), `Enter`/`Space` (expand), `P` (project picker), `A` (Ask AI), `S` (advance status), `Esc` (close), plus 5-second undo toasts.

---

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling & Motion**: Tailwind CSS + Framer Motion (light theme, reduced-motion aware)
- **Persistence**:
  - **Guest Mode**: No sign-in required. Pipeline, Arsenal, and Today save in your browser (`localStorage`). Starts completely empty.
  - **Signed-In Mode**: Google Sign-In via Firebase Auth with real-time Cloud Firestore synchronization.
  - **JSON Backups**: Export JSON and Import JSON in **Settings** work in both Guest and Signed-In modes.
- **AI**: Google Gemini API (`@google/genai`) with Google Search grounding.

---

## Getting Started

### Prerequisites
- Node.js 20+ and `npm`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (Guest Mode)
Orbit works immediately in **Guest Mode** without any API keys or Firebase setup:
```bash
npm run dev
```
Open `http://localhost:3000` and click **Continue as guest**. Your workspace starts empty and saves locally to your browser's `localStorage`. You can back up or restore your workspace anytime with **Export JSON** and **Import JSON** in **Settings**.

### 3. Signed-In Mode (Firebase Cloud Sync)
To enable Google Sign-In and Firestore synchronization:
1. Copy `.env.example` to `.env.local` and fill in your `NEXT_PUBLIC_FIREBASE_*` credentials.
2. Deploy the security rules from the repository root [`firestore.rules`](./firestore.rules) to your Firebase project.
3. Sign in with Google. To copy local guest items into your account once without duplicates, click **Import local data** in **Settings**.

### 4. Bring Your Own Key (BYOK) for Ask AI
Ask AI requires sign-in when Firebase is configured (or a user key when running a local fork without Firebase):
1. **Browser Memory Key**: Paste your Gemini API key in **Settings**. It is kept in browser memory only (never saved to `localStorage` or logged) and sent via the `X-Gemini-Key` request header.
2. **Owner Server Key**: Set `GEMINI_API_KEY`, `OWNER_UID`, and `ALLOW_SERVER_KEY=true` in `.env.local` (or hosting environment variables). The server key is only used when the verified Firebase ID token matches `OWNER_UID` and `ALLOW_SERVER_KEY=true`.
3. If no key is available, the API returns `"Add your Gemini key in Settings."`

---

## Morning Radar Job (GitHub Actions)

Orbit includes an automated morning radar job that runs on a daily schedule (`03:30 UTC` / `9:00 AM IST`) in your own GitHub fork using GitHub Actions.

> [!NOTE]
> **GitHub Fork Schedule Notice**: GitHub automatically pauses scheduled workflows on forked repositories until you manually enable Actions in the **Actions** tab, and disables scheduled workflows after 60 days of repository inactivity.

### How It Works
1. Runs 4 separate Gemini queries with Google Search grounding (1A, 1B, 1C, and 2).
2. Reads your Arsenal projects to match and recommend relevant project links.
3. Deduplicates against the last 14 days of radar history using SHA-256 URL hashes.
4. Writes the new digest directly to your Firestore database at `users/{TARGET_USER_ID}/radarDays/{date}` using Firebase Admin credentials.

### Required Secrets
Add the following repository secrets under your GitHub repository (**Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret**):

| Secret Name | Description | Source |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin Service Account Private Key | Firebase Console &rarr; Project Settings &rarr; **Service accounts** &rarr; **Generate new private key** (copy entire raw JSON) |
| `TARGET_USER_ID` | Your Firebase User UID | Firebase Console &rarr; **Authentication** &rarr; **Users** tab |
| `GEMINI_MODEL` *(optional)* | Gemini Model Name | Defaults to `gemini-3.8-flash` |

### Running the Radar Job Locally
```bash
npm run radar
```

### Cost Warning & Resource Usage
> [!WARNING]
> **API & Cost Safety**: The morning radar job executes 4 search-grounded Gemini requests per run.
> - The script enforces a hard cap of **max 8 items per section** and cross-day **14-day deduplication** to prevent runaway token or API expenses.
> - Never expose your `FIREBASE_SERVICE_ACCOUNT` or `GEMINI_API_KEY` in public repositories or pull requests.

---

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint
- `npm run radar` — Execute the morning radar discovery job
