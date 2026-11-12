// Canonical Gemini model name configured via environment variable.
export const DEFAULT_GEMINI_MODEL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_GEMINI_MODEL || process.env.GEMINI_MODEL)) ||
  '';
