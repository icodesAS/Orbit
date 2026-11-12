# Orbit

**Personal Opportunity Pipeline, Daily Radar & Project Arsenal Workspace**

A calm, keyboard-first workspace for tracking high-leverage opportunities (fellowships, residencies, campus ambassador roles, hackathons, grants, and developer perks), linking them to your project portfolio (Arsenal), and reviewing automated daily discovery digests.

---

## Workspace Architecture (4 Core Views)

### Today (Home)
Immediate execution view showing only active items expiring within 72 hours (red `<=24h`, amber `<=72h`) and a one-click jump to the morning Radar digest.

### Pipeline (3 Operational Tiers)
Table rows organized into three operational tiers with inline sub-task checklists, progress tracking, and Arsenal project linking:

- **Active Builds & Submissions** — Hard deadlines requiring immediate execution
- **Waitlists & Registration Watch** — Closed or upcoming programs to monitor
- **Submitted / Pending Verdict** — Completed applications awaiting decisions

### Radar (4 Priority Tiers)
Read-only daily discovery feed categorized into four priority tiers:

- **1A** — Campus Ambassador / Lead Roles
- **1B** — Residencies / Fellowships / Research
- **1C** — Hackathons / Internships
- **2** — Free Credits / Developer Perks

All Radar items start unverified. Source-first verification requires opening the source link before enabling **Mark verified**. Deadline-confirmed promotion via **Track** copies items into the Pipeline with an editable deadline form.

### Arsenal
Structured repository of your flagship projects, tech stacks, links, and reusable context blurbs that attach to pipeline applications and ground the Ask AI assistant.

---

## How to Use Orbit

### Path A: Using the Public Hosted Instance

#### Guest Mode (Zero Setup)
Click **Continue as guest**. Workspace starts empty. All Pipeline and Arsenal data is saved locally in your browser (`localStorage`). Use **Settings → Export JSON / Import JSON** anytime for backups.

**Important:** Guest data is saved on this device only. Clearing browser data deletes it.

#### Signed-In Mode (Cloud Sync + BYOK AI)
Sign in with Google to sync your own isolated Pipeline and Arsenal across devices via Firestore (`users/{your_uid}`).

#### Using Ask AI on the Hosted Site
To use the scoped Ask AI drawer (`A` shortcut), go to **Settings → Gemini API Key (BYOK)** and paste your own Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Your key stays strictly in browser memory for your current tab session (sent via `X-Gemini-Key` header, never stored on disk, `localStorage`, or server logs).

#### Note on Daily Radar
The automated Morning Radar cron writes exclusively to the repository owner's UID. To get your own automated daily Radar feed, follow **Path B** to fork and self-host.

---

### Path B: Self-Hosting Your Own Fork (Full Setup with Daily Radar)

#### Step 1: Clone & Run Locally (Guest Mode works out of the box)

```bash
git clone https://github.com/yourusername/orbit.git
cd orbit
npm install
npm run dev
```

Open `http://localhost:3000` and click **Continue as guest**. Your workspace starts empty and saves to `localStorage`.

---

#### Step 2: Firebase Project Setup (Auth + Firestore)

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Google Sign-In**: **Authentication → Sign-in method → Google → Enable**
3. **Create a Cloud Firestore database**: **Firestore Database → Create database → Start in production mode**
4. **Publish security rules**: Copy the contents of `firestore.rules` from the repository root and publish them in the Firebase Console (**Firestore Database → Rules → Publish**).

The provided `firestore.rules` enforce multi-user isolation (`request.auth.uid == uid`) and read-only Radar content with selective flag updates:

```javascript
// Only two flags can be updated by the user:
allow update: if isOwner(userId)
  && request.resource.data.diff(resource.data)
     .affectedKeys().hasOnly(['promoted', 'verified'])
```

Optional single-owner lock: modify the rules to restrict access to a single UID if you're the only user.

---

#### Step 3: Environment Variables (`.env.local` & Vercel)

Copy `.env.example` to `.env.local` and fill in the following:

| Variable | Required | Description | Source |
|:---------|:---------|:------------|:-------|
| **Client Variables (Browser)** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API Key | Firebase Console → Project Settings → Web App Config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth Domain | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase Project ID | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase Storage Bucket | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase Messaging Sender ID | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase App ID | Same as above |
| **Server Variables** |
| `FIREBASE_SERVICE_ACCOUNT` | Yes (for Radar) | Firebase Admin Service Account Private Key (entire JSON) | Firebase Console → Project Settings → Service accounts → Generate new private key |
| `GEMINI_API_KEY` | Yes (for Ask AI & Radar) | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | No | Gemini Model Name (default: `gemini-3.8-flash`) | Optional override |
| `OWNER_UID` | No | Your Firebase User UID | Firebase Console → Authentication → Users |
| `ALLOW_SERVER_KEY` | No | Allow server key fallback for owner (default: `false`) | Set to `true` to enable |

**Server Key Behavior:**

When `ALLOW_SERVER_KEY=true` and your Firebase ID token's UID matches `OWNER_UID`, the server uses `GEMINI_API_KEY` for Ask AI requests. This allows the fork owner to use Ask AI without pasting a browser key on every reload while keeping the server key locked away from anyone else.

If no key is available (no browser key and server key not allowed), the API returns `"Add your Gemini key in Settings."`

---

#### Step 4: Morning Radar Automation (GitHub Actions)

The Morning Radar job runs daily at `03:30 UTC` via GitHub Actions in your fork. It performs 4 search-grounded Gemini queries (one per priority tier), reads your Arsenal projects for context matching, deduplicates against the last 14 days using SHA-256 URL hashes, and writes up to 8 items per tier directly to Firestore at `users/{TARGET_USER_ID}/radarDays/{date}`.

**How it works:**

1. Runs 4 separate Gemini queries with Google Search grounding (1A, 1B, 1C, 2)
2. Reads your Arsenal projects to match and recommend relevant project links
3. Deduplicates against the last 14 days of radar history using SHA-256 URL hashes
4. Writes the new digest directly to your Firestore database using Firebase Admin credentials
5. Enforces a hard cap of **max 8 items per section** to prevent runaway API costs

**Required GitHub Actions Repository Secrets:**

Add the following secrets under **Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | Description | Source |
|:------------|:------------|:-------|
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin Service Account Private Key (entire raw JSON) | Firebase Console → Project Settings → Service accounts → Generate new private key |
| `TARGET_USER_ID` | Your Firebase User UID | Firebase Console → Authentication → Users tab |
| `GEMINI_MODEL` | *(optional)* Gemini Model Name | Defaults to `gemini-3.8-flash` |

**Important:** GitHub automatically disables scheduled workflows on forks until you manually enable them in the **Actions** tab. GitHub also disables scheduled workflows after 60 days of repository inactivity.

**Run manually:**

```bash
npm run radar
```

---

## Data Portability & Privacy Guarantees

### Guest-to-Account Migration
**Settings → Import local data** copies guest items into your signed-in account once without duplicates (deduplicates by ID and URL hash), then offers **Clear local copy**.

### Full JSON Backup
**Export JSON** and **Import JSON** work in both Guest and Signed-In modes. Use them for backups, migrations, or manual edits.

### Strict BYOK Memory-Only Handling
User-provided Gemini API keys are kept in browser memory only (never saved to `localStorage`, disk, or server logs). Keys are sent via the `X-Gemini-Key` request header and verified against Firebase ID tokens on every request.

### Firestore Security Rules
Multi-user isolation via `request.auth.uid == uid`. Radar items are read-only except for the `promoted` and `verified` boolean flags, which users can update after verification.

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|:---------|:-------|
| `Ctrl+K` / `⌘K` | Open Command Palette |
| `1` | Navigate to Today |
| `2` | Navigate to Pipeline |
| `3` | Navigate to Radar |
| `4` | Navigate to Arsenal |
| `N` | New Opportunity (context-aware) |
| `J` / `K` | Navigate down / up |
| `Enter` / `Space` | Expand focused item |
| `E` | Edit focused item |
| `P` | Open Project Picker (link Arsenal project) |
| `A` | Open Ask AI drawer |
| `S` | Advance status (Pipeline) |
| `Esc` | Close modal or drawer |
| `?` | Show shortcuts modal |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript 5
- **Styling & Motion:** Tailwind CSS 4 + Framer Motion 12 (light theme, reduced-motion aware)
- **UI Components:** Lucide React icons + class-variance-authority
- **AI:** `@google/genai` with Google Search grounding
- **Backend:** Firebase Auth + Cloud Firestore + Firebase Admin SDK
- **Automation:** GitHub Actions (scheduled cron)

---

## Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run radar    # Execute morning radar discovery job locally
npm run clean    # Clean Next.js build cache
```

---

## License

MIT
