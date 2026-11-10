// Canonical default Gemini model used across Orbit.
// Overridable via process.env.GEMINI_MODEL (or NEXT_PUBLIC_GEMINI_MODEL for client views).
export const DEFAULT_GEMINI_MODEL =
  (typeof process !== 'undefined' && (process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL)) ||
  'gemini-2.5-flash';
