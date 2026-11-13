import crypto from 'crypto';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

export async function isUrlAlive(rawUrl) {
  try {
    const res = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    });
    if ([404, 410, 500, 502, 503].includes(res.status)) return false;
    return true;
  } catch {
    // If timeout or network glitch, do not aggressively drop
    return true;
  }
}

export function hashUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    url.hostname = url.hostname.toLowerCase();
    url.protocol = url.protocol.toLowerCase();
    const params = new URLSearchParams(url.search);
    for (const key of Array.from(params.keys())) {
      const k = key.toLowerCase();
      if (k.startsWith('utm_') || ['ref', 'ref_src', 'fbclid', 'gclid', 'mc_cid', 'mc_eid', '_hsenc', '_hsmi'].includes(k)) {
        params.delete(key);
      }
    }
    params.sort();
    url.search = params.toString();
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    url.hash = '';
    return crypto.createHash('sha256').update(url.toString()).digest('hex');
  } catch {
    return crypto.createHash('sha256').update(trimmed.toLowerCase().replace(/\/+$/, '')).digest('hex');
  }
}

export function parseJsonArray(text) {
  if (!text) return [];
  try {
    const cleaned = text.trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const rawJson = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : cleaned;
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('  ⚠️ Failed to parse JSON block from Gemini output:', err.message);
    return [];
  }
}

export function initFirebaseAdmin() {
  if (getApps().length > 0) return getApps()[0];

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  let sa = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
  while (typeof sa === 'string') {
    try {
      sa = JSON.parse(sa);
    } catch {
      // Recover from double-quoted .env values with \" and expanded newlines
      let normalized = sa;
      if ((normalized.startsWith('"') && normalized.endsWith('"')) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
        normalized = normalized.slice(1, -1);
      }
      normalized = normalized
        .replace(/\\"/g, '"')
        .replace(/\\\r?\n/g, '\\n')
        .replace(/\r?\n/g, '\\n');
      try {
        sa = JSON.parse(normalized);
      } catch (err) {
        throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${err.message}`);
      }
    }
  }

  if (!sa || typeof sa !== 'object' || !sa.project_id || !sa.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid Firebase service account JSON object.');
  }

  if (typeof sa.private_key === 'string') {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  }

  return initializeApp({ credential: cert(sa) });
}

export async function generateWithFallback({
  ai,
  modelName,
  fallbackModel,
  prompt,
  useSearch = false,
  thinkingLevel,
  onModelSwitch,
  onSearchDisabled,
}) {
  let activeModel = modelName;
  let activeThinking = thinkingLevel;
  let attempts = 0;

  while (attempts < 3) {
    attempts++;
    const config = {};
    if (activeThinking) config.thinkingConfig = { thinkingLevel: activeThinking };
    if (useSearch) config.tools = [{ googleSearch: {} }];

    try {
      return await ai.models.generateContent({
        model: activeModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        ...(Object.keys(config).length > 0 ? { config } : {}),
      });
    } catch (err) {
      const msg = err?.message || String(err);
      const msgLower = msg.toLowerCase();

      if (useSearch && (msgLower.includes('429') || msgLower.includes('resource_exhausted'))) {
        console.log('   ℹ️ Search grounding rate-limited; retrying without search grounding...');
        useSearch = false;
        onSearchDisabled?.();
        attempts--;
        continue;
      }

      const isTimeout = msgLower.includes('504') || msgLower.includes('deadline') || msgLower.includes('timeout') || msgLower.includes('abort');
      const isTransient = isTimeout || msgLower.includes('503') || msgLower.includes('high demand') ||
        msgLower.includes('unavailable') || msgLower.includes('404') || msgLower.includes('not found') ||
        msgLower.includes('resource_exhausted') || msgLower.includes('429');

      if (isTransient && fallbackModel && activeModel !== fallbackModel) {
        console.log(`   ⚠️ ${activeModel} failed (${msg.slice(0, 60)}); falling back to ${fallbackModel}...`);
        activeModel = fallbackModel;
        if (isTimeout && activeThinking !== 'LOW') activeThinking = 'LOW';
        onModelSwitch?.(activeModel);
        continue;
      }
      if (isTimeout && activeThinking && activeThinking !== 'LOW') {
        console.log('   ⚠️ High thinking timed out; retrying with LOW reasoning...');
        activeThinking = 'LOW';
        continue;
      }
      if (attempts < 3 && isTransient) {
        console.log(`   ⏳ Gemini busy (${msg.slice(0, 45)}...), retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      throw err;
    }
  }
}
