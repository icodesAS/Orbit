import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';
import { buildAskSystemInstruction, sanitizeField } from '@/prompts';

interface LinkedProjectInput {
  title: string;
  techStack?: string[];
  contextBlurb?: string;
}

interface OpportunityInput {
  code?: string;
  title?: string;
  organization?: string;
  type?: string;
  status?: string;
  deadline?: string | null;
  url?: string | null;
  applicationCopy?: string | null;
  notes?: string | null;
  tasksDone?: number;
  tasksTotal?: number;
  tasks?: { done: boolean; title: string }[];
}

interface ChatMessageInput {
  role: string;
  content: string;
}

const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQ_PER_WINDOW = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  for (const [k, timestamps] of requestLog.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (valid.length === 0) requestLog.delete(k);
    else requestLog.set(k, valid);
  }

  const timestamps = (requestLog.get(clientKey) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= MAX_REQ_PER_WINDOW) {
    requestLog.set(clientKey, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(clientKey, timestamps);
  return false;
}

async function verifyFirebaseIdToken(idToken: string, apiKey: string): Promise<string | null> {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const endpoint = emulatorHost
    ? `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const uid = data?.users?.[0]?.localId;
    return typeof uid === 'string' && uid.length > 0 ? uid : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    if (isRateLimited(`ip:${clientIp}`)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const rawBody = await req.text();
    if (rawBody.length > 100 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const isFirebaseConfigured = Boolean(firebaseApiKey && firebaseProjectId);

    // 1. Server-side authentication check when Firebase is configured
    let verifiedUid: string | null = null;
    if (isFirebaseConfigured && firebaseApiKey) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Sign in to use Ask AI' }, { status: 401 });
      }
      const token = authHeader.slice(7).trim();
      if (!token) {
        return NextResponse.json({ error: 'Sign in to use Ask AI' }, { status: 401 });
      }
      verifiedUid = await verifyFirebaseIdToken(token, firebaseApiKey);
      if (!verifiedUid) {
        return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
      }
      if (isRateLimited(`uid:${verifiedUid}`)) {
        return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
      }
    }

    // 2. Key resolution:
    // - User key from X-Gemini-Key header
    // - Server GEMINI_API_KEY only if Firebase is configured, ALLOW_SERVER_KEY=true, and uid === OWNER_UID
    const rawUserKey = req.headers.get('x-gemini-key')?.trim();
    const serverEnvKey = process.env.GEMINI_API_KEY?.trim();
    const allowServerKey = process.env.ALLOW_SERVER_KEY === 'true';
    const ownerUid = process.env.OWNER_UID?.trim();

    let apiKey: string | null = null;
    if (rawUserKey && rawUserKey !== 'MY_GEMINI_API_KEY') {
      apiKey = rawUserKey;
    } else if (
      isFirebaseConfigured &&
      allowServerKey &&
      Boolean(ownerUid) &&
      verifiedUid === ownerUid &&
      serverEnvKey &&
      serverEnvKey !== 'MY_GEMINI_API_KEY'
    ) {
      apiKey = serverEnvKey;
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Add your Gemini key in Settings.' }, { status: 400 });
    }

    const { prompt, opportunity, linkedProjects, history } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Prompt too long (max 2000 characters)' }, { status: 400 });
    }
    if (history !== undefined && (!Array.isArray(history) || history.length > 50)) {
      return NextResponse.json({ error: 'Invalid chat history' }, { status: 400 });
    }
    if (Array.isArray(linkedProjects) && linkedProjects.length > 20) {
      return NextResponse.json({ error: 'Too many linked projects (max 20)' }, { status: 400 });
    }

    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    if (!modelName) {
      return NextResponse.json({ error: 'GEMINI_MODEL environment variable is not configured on the server.' }, { status: 500 });
    }
    const opp = (opportunity || {}) as OpportunityInput;
    const projects = Array.isArray(linkedProjects) ? (linkedProjects as LinkedProjectInput[]) : [];

    const systemInstruction = buildAskSystemInstruction({
      opportunity: opp,
      linkedProjects: projects,
    });

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'orbit-app' } },
    });

    const rawHistory: ChatMessageInput[] = Array.isArray(history)
      ? history
          .filter((m: any) => m && typeof m === 'object' && typeof m.content === 'string')
          .map((m: any) => ({
            role: String(m.role || 'user'),
            content: String(m.content),
          }))
      : [];
    const firstUserIndex = rawHistory.findIndex((m) => m.role === 'user');
    const trimmedHistory = firstUserIndex >= 0 ? rawHistory.slice(firstUserIndex) : [];
    const conversationHistory = trimmedHistory.slice(-8).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: sanitizeField(msg.content, 4000) }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...conversationHistory,
        { role: 'user', parts: [{ text: sanitizeField(prompt, 2000) }] },
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: { web?: { title?: string; uri?: string } }) =>
        c.web?.uri ? { title: c.web.title || c.web.uri, uri: c.web.uri } : null
      )
      .filter(Boolean);

    return NextResponse.json({
      text: response.text || 'No response generated.',
      sources,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Gemini API Error]', msg);
    if (msg.includes('API key') || msg.includes('API_KEY_INVALID')) {
      return NextResponse.json({ error: 'Invalid Gemini API key. Please check your key in Settings.' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Unable to generate response. Please try again later.' },
      { status: 500 }
    );
  }
}
