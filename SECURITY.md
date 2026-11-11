# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Orbit, please report it privately via GitHub Security Advisories on this repository rather than opening a public issue.

## Security Architecture

- **Guest vs. Signed-In Isolation**: Guest data lives strictly in browser `localStorage` (`orbit_guest_v1_*`) and never mixes with signed-in Firestore data.
- **Ask AI Authentication**: When Firebase is configured, `/api/gemini/ask` verifies the caller's Firebase ID token on the server for every request and rejects unauthenticated requests with HTTP `401`.
- **API Key Precedence**: User keys pasted in Settings are held in browser memory only and sent via the `X-Gemini-Key` header (never stored in `localStorage` or logged). The server `GEMINI_API_KEY` is used only when `ALLOW_SERVER_KEY=true` and the verified Firebase `uid` matches `OWNER_UID`.
- **Firestore Security Rules**: Located in `firestore.rules`. Enforces owner-only access (`request.auth.uid == userId`), field validation, and read-only Radar items except for boolean `promoted` and `verified` flags.
