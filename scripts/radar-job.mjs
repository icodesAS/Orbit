import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load .env.local first (Next.js convention), then fall back to .env
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
dotenv.config();

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  RADAR_TIERS,
  buildRadarDiscoveryPrompt,
  buildRadarMatchingPrompt,
} from './radar-prompts.mjs';

async function isUrlAlive(rawUrl) {
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

function hashUrl(rawUrl) {
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

function parseJsonArray(text) {
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

function initFirebaseAdmin() {
  if (getApps().length > 0) return getApps()[0];

  let credential;
  // Only use environment variable for security - never read from local file
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let sa = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    while (typeof sa === 'string') {
      try {
        sa = JSON.parse(sa);
      } catch {
        break;
      }
    }
    credential = cert(sa);
  } else {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT secret or service-account.json file.');
  }

  return initializeApp({ credential });
}

async function runRadarJob() {
  console.log('🚀 Orbit Morning Radar Job starting...');

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const userId = (process.env.TARGET_USER_ID || process.env.FIREBASE_UID)?.trim();
  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is required.');
  if (!userId) throw new Error('TARGET_USER_ID (or FIREBASE_UID) environment variable is required.');

  initFirebaseAdmin();
  const db = getFirestore();

  const todayDate = new Date().toISOString().split('T')[0];
  console.log(`📅 Target Date: ${todayDate} | User UID: <redacted>`);

  // 1. Fetch user's Arsenal projects
  console.log('📦 Fetching Arsenal projects for context matching...');
  const projectsSnap = await db.collection(`users/${userId}/projects`).get();
  const arsenalProjects = projectsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`   Found ${arsenalProjects.length} Arsenal project(s).`);

  // 2. Fetch past 14 days of radar items for urlHash deduplication
  console.log('🔍 Fetching past 14-day history for deduplication...');
  const pastDaysSnap = await db.collection(`users/${userId}/radarDays`).orderBy('date', 'desc').limit(14).get();
  const seenHashes = new Set();
  const seenUrls = [];

  for (const dayDoc of pastDaysSnap.docs) {
    const itemsSnap = await db.collection(`users/${userId}/radarDays/${dayDoc.id}/items`).get();
    for (const itemDoc of itemsSnap.docs) {
      const data = itemDoc.data();
      if (data.urlHash) seenHashes.add(data.urlHash);
      if (data.url) seenUrls.push(data.url);
    }
  }
  console.log(`   Loaded ${seenHashes.size} unique URL hashes from recent history.`);

  // 3. Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'orbit-radar-job' } },
  });

  const allCollectedItems = [];

  // 4. Execute 4 separate search-grounded Gemini queries
  for (let i = 0; i < RADAR_TIERS.length; i++) {
    const tier = RADAR_TIERS[i];
    if (i > 0) {
      console.log('   ⏳ Waiting 3s to respect free-tier rate limits...');
      await new Promise((r) => setTimeout(r, 3000));
    }
    console.log(`\n📡 [Pass 1] Querying Priority ${tier.priority}: ${tier.name}...`);
    const prompt = buildRadarDiscoveryPrompt({ tier, currentDateIso: todayDate, seenUrls });

    try {
      let response;
      let activeModel = modelName;
      let attempts = 0;

      while (attempts < 2) {
        attempts++;
        try {
          try {
            // Attempt search-grounded generation with high thinking first
            response = await ai.models.generateContent({
              model: activeModel,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
                tools: [{ googleSearch: {} }],
              },
            });
          } catch (searchErr) {
            if (searchErr.message?.includes('429') || searchErr.message?.includes('RESOURCE_EXHAUSTED')) {
              console.log('   ℹ️ Search grounding rate-limited; generating with high reasoning...');
              response = await ai.models.generateContent({
                model: activeModel,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                  thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
                },
              });
            } else {
              throw searchErr;
            }
          }
          break;
        } catch (genErr) {
          if (genErr.message?.includes('RESOURCE_EXHAUSTED') && activeModel !== 'gemini-3.5-flash') {
            console.log(`   ⚠️ Quota reached for ${activeModel}; falling back to gemini-3.5-flash (HIGH reasoning)...`);
            activeModel = 'gemini-3.5-flash';
          } else if (attempts < 2 && (genErr.message?.includes('503') || genErr.message?.includes('429'))) {
            console.log(`   ⏳ Gemini busy (${genErr.message.slice(0, 45)}...), retrying in 4s...`);
            await new Promise((r) => setTimeout(r, 4000));
          } else {
            throw genErr;
          }
        }
      }

      const parsedItems = parseJsonArray(response.text);
      console.log(`   Retrieved ${parsedItems.length} candidate items from Gemini.`);

      let sectionCount = 0;
      for (const raw of parsedItems) {
        if (!raw.title || !raw.url) continue;
        const cleanUrl = String(raw.url).trim();
        if (!cleanUrl.startsWith('https://')) continue;
        const uHash = hashUrl(cleanUrl);

        if (seenHashes.has(uHash)) {
          console.log(`   ↳ Skipping duplicate: "${raw.title}"`);
          continue;
        }

        // 1. Validate deadline & drop past deadlines
        let validDeadline = null;
        if (raw.deadline) {
          const d = new Date(String(raw.deadline).trim());
          if (!isNaN(d.getTime())) {
            // Drop expired deadlines (older than 24 hours ago)
            if (d.getTime() < Date.now() - 86400000) {
              console.log(`   ↳ Skipping expired deadline (${raw.deadline}): "${raw.title}"`);
              continue;
            }
            // Only set confirmed deadline if confidence is stated
            if (raw.deadlineConfidence === 'stated') {
              validDeadline = d.toISOString();
            }
          }
        }

        // 2. Validate URL liveness (drop dead 404 / 500 links)
        const isAlive = await isUrlAlive(cleanUrl);
        if (!isAlive) {
          console.log(`   ↳ Dropping dead URL (${cleanUrl}): "${raw.title}"`);
          continue;
        }

        const validFormats = ['fresh_build', 'open_track', 'unclear'];
        const format = validFormats.includes(raw.format) ? raw.format : 'unclear';
        const deadlineConfidence = ['stated', 'inferred', 'unknown'].includes(raw.deadlineConfidence)
          ? raw.deadlineConfidence
          : validDeadline ? 'stated' : 'unknown';

        seenHashes.add(uHash);
        const itemId = `radar-${tier.priority.toLowerCase()}-${crypto.randomUUID()}`;
        const itemRecord = {
          id: itemId,
          title: String(raw.title).trim(),
          organization: String(raw.organization || 'General').trim(),
          type: raw.type || 'other',
          url: cleanUrl,
          urlHash: uHash,
          summary: String(raw.summary || '').trim(),
          deadline: validDeadline,
          deadlineConfidence,
          format,
          source: String(raw.source || cleanUrl).trim(),
          priority: tier.priority,
          verified: false,
          promoted: false,
          recommendedProjectId: null,
          createdAt: FieldValue.serverTimestamp(),
        };

        allCollectedItems.push(itemRecord);
        sectionCount++;
        if (sectionCount >= 8) break;
      }
      console.log(`   ✅ Accepted ${sectionCount} verified items for Priority ${tier.priority}.`);
    } catch (err) {
      console.error(`   ❌ Error querying section ${tier.priority}:`, err.message);
    }
  }

  // Pass 2: Lightweight Arsenal Project Matching (Non-grounded)
  if (arsenalProjects.length > 0 && allCollectedItems.length > 0) {
    console.log(`\n🎯 [Pass 2] Matching ${allCollectedItems.length} candidate items with ${arsenalProjects.length} Arsenal projects...`);
    try {
      const matchPrompt = buildRadarMatchingPrompt({
        items: allCollectedItems.map((it) => ({
          id: it.id,
          title: it.title,
          organization: it.organization,
          summary: it.summary,
          format: it.format,
        })),
        arsenalProjects: arsenalProjects.map((p) => ({
          id: p.id,
          title: p.title,
          techStack: p.techStack,
        })),
      });

      const matchRes = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: matchPrompt }] }],
      });

      const matches = parseJsonArray(matchRes.text);
      const validProjectIds = new Set(arsenalProjects.map((p) => p.id));
      const matchMap = new Map();

      for (const m of matches) {
        if (m.itemId && m.recommendedProjectId && validProjectIds.has(m.recommendedProjectId)) {
          matchMap.set(m.itemId, m.recommendedProjectId);
        }
      }

      let matchCount = 0;
      for (const item of allCollectedItems) {
        if (matchMap.has(item.id)) {
          item.recommendedProjectId = matchMap.get(item.id);
          matchCount++;
          console.log(`   ↳ Matched "${item.title}" -> Project: ${item.recommendedProjectId}`);
        }
      }
      console.log(`   ✅ Assigned ${matchCount} verified project matches.`);
    } catch (matchErr) {
      console.warn('   ⚠️ Pass 2 matching skipped due to error:', matchErr.message);
    }
  }

  // 5. Write to Firestore with Admin SDK
  console.log(`\n💾 Writing ${allCollectedItems.length} total items to Firestore...`);
  const rootRef = db.doc(`users/${userId}/radarDays/${todayDate}`);
  await rootRef.set({
    date: todayDate,
    generatedAt: FieldValue.serverTimestamp(),
    model: modelName,
    itemCount: allCollectedItems.length,
  }, { merge: true });

  const batch = db.batch();
  for (const item of allCollectedItems) {
    const itemRef = db.doc(`users/${userId}/radarDays/${todayDate}/items/${item.id}`);
    batch.set(itemRef, item, { merge: true });
  }
  await batch.commit();

  console.log(`🎉 Morning Radar Job completed successfully! ${allCollectedItems.length} items published.`);
}

runRadarJob().catch((err) => {
  console.error('\n💥 Fatal Error running morning radar job:', err);
  process.exit(1);
});
