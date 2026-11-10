# Orbit rules (read before any change)

## Decisions (WIN over every other doc)

- Stack: Next.js + Tailwind + Framer Motion + Firebase. Not Vite.
- Design: this file + docs/07_UI_REDESIGN.md are law. Light theme.
- Home = Today page. Pipeline = table rows in 3 tiers. Board view later.
- Deadline chips: grey >3 days, amber <=3 days, red <=24 hours.
  Soft colors, no pulse.
- Radar: 4 priorities: 1A campus ambassador/lead roles, 1B residencies/
  fellowships/research, 1C hackathons/internships, 2 free credits/perks.
- Radar content is read-only. Only two flags change: promoted, verified.
- Verified: user must open the source link first, then click Mark
  verified. Track is allowed anytime but shows a small form to confirm
  the deadline (prefilled, editable).
- Radar job: runs in each user's own fork via GitHub Actions with their
  own secrets. Time shown in the user's local timezone.
- Ask AI key: user pastes it in Settings. Kept in browser memory only,
  sent with each request to our route (never stored or logged).
  Order: user key, then server env key, then demo fallback. No
  "Secret Manager" plans.
- Demo vs Live: Live only if Firebase env vars exist, else Demo.
  Demo saves to localStorage. Live uses Firestore.
- Demo data: fictional ("Sample Project A"), always labelled SAMPLE.
  Public docs never name my real projects. I add them in Arsenal.
- Keys: E = edit, Enter/Space = expand, P = open project picker.
- Mobile tabs: Today | Pipeline | Radar | Arsenal. Settings in menu.
- Rules file lives in repo root firestore.rules, not in the app UI.
- docs/06 is archived. Ignore it.

## Always

- Never invent my projects, opportunities, or data. Demo data lives
  only in /demo/demoData.ts and must be labelled SAMPLE everywhere.
- Nothing personal hardcoded: no project names, model names, dates,
  timezones, counts. Use settings or environment variables.
- AI only appears in: (1) Ask AI drawer, (2) morning radar job.
- Radar items are read-only except promoted and verified.
- Promote / Track = copy into the pipeline. Confirm deadline in a form.
- "Verified" only after the user opens the source and then marks verified.
- Light, clean, minimal design. No glow, gradients, glass, neon.
- Keep files under 300 lines. One component per file.
- Make a plan first and wait for my OK. After each phase: run
  the build, then stop and summarise what changed.
- If unsure or docs conflict, ask. Never guess. These decisions win.
