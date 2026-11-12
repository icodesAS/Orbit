# Orbit Prompt Engine (`/prompts`)

This directory is the **single source of truth** for all AI system prompts, tier definitions, and response schemas used across Orbit.

If you are forking Orbit or customizing it for your own workflow, **edit prompts here**. Do not edit `app/api/gemini/ask/route.ts` or `scripts/radar-job.mjs` directly, as those handle authentication, validation, and database operations.

---

## Structure

- **`radar.mjs`**: Morning Radar configuration, 4 priority tier definitions, discovery prompts, and project-matching prompts.
- **`ask.mjs`**: Ask AI system instruction builders, contextual opportunity prompts, and action presets.
- **`schemas.mjs`**: Expected JSON schemas and parsing contracts for Gemini outputs.
- **`index.mjs`**: Aggregated entry point for both Next.js App Router and standalone Node.js scripts.
- **`index.d.ts`**: TypeScript type declarations for full static analysis and autocomplete.

---

## Customizing for Your Fork

### 1. Customizing Radar Tiers or Focus
Open `prompts/radar.mjs` and edit `RADAR_TIERS`. You can modify:
- Tier names, focus descriptions, or examples.
- Add specific search directives (e.g. prioritize specific hackathon platforms or virtual formats).

### 2. Customizing Ask AI Persona & Advice
Open `prompts/ask.mjs` and adjust `DEFAULT_ASK_AI_RULES` or `buildAskSystemInstruction`.
You can change:
- Tone of advice (e.g. more technical, more focused on VC/grant pitch style).
- Default checklist templates or proposal structures.
