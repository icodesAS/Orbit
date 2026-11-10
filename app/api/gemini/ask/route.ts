import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_GEMINI_MODEL } from '@/lib/config';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, opportunity, linkedProjects, history, userKey } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Key order: 1) user memory key (from body or header), 2) server env, 3) demo fallback
    // Never log or store the key
    const rawUserKey = (typeof userKey === 'string' && userKey.trim()) || req.headers.get('x-gemini-key')?.trim();
    const serverEnvKey = process.env.GEMINI_API_KEY?.trim();
    const apiKey = (rawUserKey && rawUserKey !== 'MY_GEMINI_API_KEY' ? rawUserKey : null) ||
      (serverEnvKey && serverEnvKey !== 'MY_GEMINI_API_KEY' ? serverEnvKey : null);

    const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    const opp = (opportunity || {}) as OpportunityInput;
    const projects = Array.isArray(linkedProjects) ? (linkedProjects as LinkedProjectInput[]) : [];

    const projectsContext = projects.length > 0
      ? projects
          .map((p) => `- **${p.title}** (${(p.techStack || []).join(', ')}): ${p.contextBlurb || 'No description provided.'}`)
          .join('\n')
      : 'None linked yet.';

    const tasksContext = Array.isArray(opp.tasks) && opp.tasks.length > 0
      ? opp.tasks.map((t) => `  [${t.done ? 'x' : ' '}] ${t.title}`).join('\n')
      : '  No sub-tasks listed.';

    const systemInstruction = `You are Orbit Ask AI — an advisor embedded inside the Orbit Opportunity & Pipeline Command Center.
You are strictly scoped to the following opportunity and its linked Arsenal projects:

OPPORTUNITY:
- Code: ${opp.code || 'N/A'}
- Title: ${opp.title || 'Untitled'}
- Organization: ${opp.organization || 'Unspecified'}
- Type: ${opp.type || 'General'}
- Status: ${opp.status || 'Active'}
- Deadline: ${opp.deadline || 'Unscheduled'}
- URL: ${opp.url || 'None'}
- Current Application Copy: ${opp.applicationCopy || 'None'}
- Builder Notes: ${opp.notes || 'None'}
- Sub-tasks (${opp.tasksDone || 0}/${opp.tasksTotal || 0}):
${tasksContext}

LINKED ARSENAL PROJECTS:
${projectsContext}

RULES:
- Be concise, technical, and immediately actionable.
- Draft concrete application answers, eligibility checks, or submission checklists based only on the opportunity details and linked projects above.
- If no projects are linked, suggest how to position a project from scratch for this opportunity type.
- Never invent metrics, benchmarks, or projects not present in the context above.`;

    // Demo fallback when no key is provided
    if (!apiKey) {
      const projSummary = projects.length > 0
        ? projects.map((p) => p.title).join(', ')
        : 'None';

      const pendingTasks = Array.isArray(opp.tasks)
        ? opp.tasks.filter((t) => !t.done)
        : [];

      const nextTaskText = pendingTasks.length > 0
        ? `Next pending task: "${pendingTasks[0].title}".`
        : 'All current sub-tasks are marked complete.';

      const fallbackText = `**Demo Mode Response for ${opp.code || 'Opportunity'} (${opp.title || 'Untitled'})**\n\n` +
        `• **Linked Projects**: ${projSummary}\n` +
        `• **Target**: ${opp.organization || 'Program'}\n` +
        `• **Sub-task Status**: ${opp.tasksDone || 0} of ${opp.tasksTotal || 0} complete. ${nextTaskText}\n\n` +
        `*To enable live AI completions and search grounding, paste your Gemini API key in Settings (kept in browser memory only) or set GEMINI_API_KEY.*`;

      return NextResponse.json({
        text: fallbackText,
        sources: opp.url ? [{ title: `${opp.organization || 'Official'} Portal`, uri: opp.url }] : [],
        mode: 'demo',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'orbit-app',
        },
      },
    });

    // Gemini API requires chat history to start with a 'user' turn.
    // Drop any leading assistant/model messages before sending.
    const rawHistory = Array.isArray(history) ? (history as ChatMessageInput[]) : [];
    let firstUserIndex = -1;
    for (let i = 0; i < rawHistory.length; i++) {
      if (rawHistory[i].role === 'user') {
        firstUserIndex = i;
        break;
      }
    }

    const trimmedHistory = firstUserIndex >= 0 ? rawHistory.slice(firstUserIndex) : [];
    const conversationHistory = trimmedHistory.slice(-8).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...conversationHistory,
        { role: 'user', parts: [{ text: prompt }] },
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
      mode: 'live',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to reach Gemini API';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
