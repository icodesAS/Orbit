import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, opportunity, linkedProjects, history } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Build rich tactical system instruction scoped strictly to this opportunity and its linked Arsenal projects
    const projectsContext = Array.isArray(linkedProjects) && linkedProjects.length > 0
      ? linkedProjects
          .map(
            (p: { title: string; techStack?: string[]; contextBlurb?: string }) =>
              `- **${p.title}** (${(p.techStack || []).join(', ')}): ${p.contextBlurb}`
          )
          .join('\n')
      : 'None linked yet.';

    const tasksContext = Array.isArray(opportunity?.tasks)
      ? opportunity.tasks
          .map((t: { done: boolean; title: string }) => `  [${t.done ? 'x' : ' '}] ${t.title}`)
          .join('\n')
      : '';

    const systemInstruction = `You are Orbit Ask AI — a tactical, high-precision engineering advisor embedded inside the Orbit Opportunity & Pipeline Command Center.
You are strictly scoped to the following opportunity and its linked Arsenal projects:

OPPORTUNITY:
- Code: ${opportunity?.code || 'N/A'}
- Title: ${opportunity?.title || 'Unknown'}
- Organization: ${opportunity?.organization || 'Unknown'}
- Type: ${opportunity?.type || 'Unknown'}
- Status: ${opportunity?.status || 'Unknown'}
- Deadline: ${opportunity?.deadline || 'Unscheduled'}
- URL: ${opportunity?.url || 'None'}
- Current Pitch / Copy: ${opportunity?.applicationCopy || 'None'}
- Builder Notes: ${opportunity?.notes || 'None'}
- Sub-tasks (${opportunity?.tasksDone || 0}/${opportunity?.tasksTotal || 0}):
${tasksContext}

LINKED ARSENAL PROJECTS:
${projectsContext}

RULES:
- Be concise, technical, and immediately actionable (Linear/Raycast style).
- Write concrete application copy, technical architecture pitches, or checklist steps tailored to the linked projects (such as PatchTree, SentinelFlow, ChronosKV).
- Never invent generic fluff; anchor every recommendation in the specific tech stack and metrics of the linked projects.`;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Deterministic, context-aware fallback for zero-backend Demo Mode
      const projNames =
        Array.isArray(linkedProjects) && linkedProjects.length > 0
          ? linkedProjects.map((p: { title: string }) => p.title).join(' + ')
          : 'your Arsenal projects';

      const pendingTasks = Array.isArray(opportunity?.tasks)
        ? opportunity.tasks.filter((t: { done: boolean }) => !t.done)
        : [];

      const nextTaskLine =
        pendingTasks.length > 0
          ? `Next critical sub-task: **${pendingTasks[0].title}** (${opportunity.tasksDone}/${opportunity.tasksTotal} complete).`
          : `All ${opportunity?.tasksTotal || 0} sub-tasks are marked complete.`;

      const fallbackReply = `**Tactical synthesis for ${opportunity?.code} (${opportunity?.title})**\n\n- **Positioning ${projNames}**: Anchor the opening hook on verifiable execution metrics (\`<180ms\` AST synthesis in PatchTree, \`<0.4ms\` eBPF kernel enforcement in SentinelFlow) directly aligned with **${opportunity?.organization}**'s review criteria.\n- **Draft Pitch Snippet**: *"${opportunity?.applicationCopy || `We combine ${projNames} to deliver deterministic verification and runtime isolation for autonomous AI workflows.`}"*\n- **Execution Status**: ${nextTaskLine}`;

      return NextResponse.json({
        text: fallbackReply,
        sources: opportunity?.url
          ? [{ title: `${opportunity.organization} Official Portal`, uri: opportunity.url }]
          : [],
        mode: 'demo',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const conversationHistory = Array.isArray(history)
      ? history.slice(-6).map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))
      : [];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    return NextResponse.json(
      {
        error: errMsg,
      },
      { status: 500 }
    );
  }
}
