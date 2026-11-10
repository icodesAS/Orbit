# Orbit — Security Review & Remaining Loopholes

## Addressed Risks

- Per-user isolation: firestore.rules at repo root restrict access per path under users/{uid}. No single catch-all document=** rule (Firestore ORs matching rules).
- Key handling: Gemini keys never stored in the repository.
- Radar immutability: Daily documents use date as ID. Users may change only promoted and verified.
- Deduplication: urlHash prevents the same opportunity appearing across multiple mornings.
- Cost control: Morning job (later) runs on the user's own GitHub Actions with their own secret, or is disabled in Demo mode.
- No confirmation dialogs for archive/status: Replaced by 5-second Undo toast. Track uses a deadline-confirm form.

## Remaining Loopholes & Mitigations

### 1. Client-side Gemini Key Storage (BYOK)

Risk: If the key is stored in localStorage or IndexedDB, XSS can exfiltrate it.

Mitigation:

- Ask AI: user pastes the key in Settings. It stays in browser memory only. It is sent with each request to our route and is never stored or logged.
- Key order for Ask AI: user key, then server env key, then demo fallback.
- 9 AM radar job (later): the key is a GitHub Actions secret on the user's own fork. A browser-only key cannot work because the job runs while the browser is closed.
- Strongly recommend users create a restricted API key (HTTP referrer or IP limited if possible).
- Document clearly that Demo mode needs no key.

### 2. Optimistic Updates + Multi-device

Risk: Two devices can create conflicting status or sortOrder changes.

Mitigation:

- Last-write-wins is acceptable for v1.
- Include updatedAt and show a subtle “updated on another device” indicator if needed later.
- For critical fields, consider a simple version field.

### 3. Gemini Hallucinations

Risk: Incorrect deadlines, eligibility, or dead links.

Mitigation (already required):

- Every radar item shows Source link + Mark verified (enabled only after the source was opened).
- Never auto-promote. User must explicitly Track.
- Track shows a small form to confirm the deadline (prefilled, editable).

### 4. Radar Job Cost & Abuse

Risk: If the open-source version ever runs a shared cron, costs explode.

Mitigation:

- Job is per-user and uses the user’s own key.
- The job runs on the user's own GitHub Actions with their own secret, so a fork never uses the owner's key.
- In pure open-source forks, the job is optional / self-hosted only.
- Add a clear cost warning in README.
- Not in this build pass.

### 5. PWA / FCM on iOS

Risk: Push only works after “Add to Home Screen”. Users may miss notifications.

Mitigation:

- Detect standalone mode and gently prompt once.
- Fall back to in-app badges and the Today page.
- Not in this build pass.

### 6. Demo Mode Data Leakage

Risk: Accidental write to real Firebase while in Demo mode.

Mitigation:

- Live only if Firebase env vars exist, else Demo.
- Demo saves to localStorage and must not write to Firestore.
- Check at the highest level before any Firebase import/use.

### 7. urlHash Collisions

Risk: Naive hash of URL could theoretically collide.

Mitigation:

- Use a strong hash (SHA-256 truncated) of normalized URL.
- Fallback to title + domain if needed.

### 8. Open-Source Supply Chain

Risk: Future contributors accidentally commit keys or loosen rules.

Mitigation:

- .env.example only.
- Pre-commit or CI check for common secret patterns.
- firestore.rules at repo root is part of the reviewed core. Do not paste it into the Settings UI.

### 9. GitHub Actions can start late and secrets must never be printed in logs.

## Recommended Immediate Hardening

- Never persist the Gemini API key (memory only; never localStorage; never logs).
- Make Demo mode the default when no Firebase env vars are present.
- verified starts false. Mark verified only after the source link was opened.
- Track always confirms deadline in a small form.
- Document firestore.rules in the README by pointing at the file, not by duplicating it in the UI.
