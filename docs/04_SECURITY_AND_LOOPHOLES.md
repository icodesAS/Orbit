# Orbit — Security Review & Remaining Loopholes

## Addressed Risks

- Per-user isolation: Firestore rules restrict all access to users/{uid}/**.
- Key handling: Gemini keys never stored in the repository. BYOK only.
- Radar immutability: Daily documents use date as ID and are treated as write-once.
- Deduplication: urlHash prevents the same opportunity appearing across multiple mornings.
- Cost control: 9 AM job runs only with the user’s own key (or is disabled in Demo mode).
- No confirmation dialogs for destructive actions: Replaced by 5-second Undo toast.

## Remaining Loopholes & Mitigations

### 1. Client-side Gemini Key Storage (BYOK)

Risk: If the key is stored in localStorage or IndexedDB, XSS can exfiltrate it.

Mitigation:

- Ask AI: the key stays in browser memory only.
- 9 AM radar job: the key is stored on the server as a GitHub Actions secret (or Cloud Function secret). A browser-only key cannot work because the job runs while the browser is closed.
- Strongly recommend users create a restricted API key (HTTP referrer or IP limited if possible).
- Document clearly that Demo mode needs no key.
- Future: support Firebase Secret Manager or user-owned Cloud Function proxy.

### 2. Optimistic Updates + Multi-device

Risk: Two devices can create conflicting status or sortOrder changes.

Mitigation:

- Last-write-wins is acceptable for v1.
- Include updatedAt and show a subtle “updated on another device” indicator if needed later.
- For critical fields, consider a simple version field.

### 3. Gemini Hallucinations

Risk: Incorrect deadlines, eligibility, or dead links.

Mitigation (already required):

- Every radar item shows Source link + Verify badge.
- Never auto-promote. User must explicitly “Track”.
- Allow manual deadline override after promotion.

### 4. Radar Job Cost & Abuse

Risk: If the open-source version ever runs a shared cron, costs explode.

Mitigation:

- Job is per-user and uses the user’s own key.
- The job runs on the user's own GitHub Actions with their own secret, so a fork never uses the owner's key.
- In pure open-source forks, the job is optional / self-hosted only.
- Add a clear cost warning in README.

### 5. PWA / FCM on iOS

Risk: Push only works after “Add to Home Screen”. Users may miss notifications.

Mitigation:

- Detect standalone mode and gently prompt once.
- Fall back to in-app badges and the Today strip.

### 6. Demo Mode Data Leakage

Risk: Accidental write to real Firebase while in Demo mode.

Mitigation:

- Demo mode must short-circuit all Firebase imports and use only local state + fake JSON.
- Feature flag checked at the highest level.

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
- Security rules file is part of the reviewed core.

### 9. GitHub Actions can start late and secrets must never be printed in logs.

## Recommended Immediate Hardening

- Never persist Gemini API key in localStorage without encryption + clear warning.
- Make Demo mode the default when no Firebase config is present.
- Add verified: boolean and force manual confirmation of deadlines on promotion.
- Document the exact Firestore security rules in the README and keep them minimal.
