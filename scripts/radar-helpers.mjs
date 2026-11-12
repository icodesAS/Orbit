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
      break;
    }
  }

  return initializeApp({ credential: cert(sa) });
}
