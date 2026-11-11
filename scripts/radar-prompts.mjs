// Prompt templates and configuration for the 4 Morning Radar priority tiers.

export const RADAR_TIERS = [
  {
    priority: '1A',
    name: 'Campus Ambassador & Lead Roles',
    focus: 'Student campus ambassador, campus lead, developer student club lead, student evangelist, or community advocate programs in technology, AI, open source, and software engineering.',
    examples: 'GitHub Campus Experts, Google Developer Student Clubs (GDSC), Microsoft Learn Student Ambassadors, Major League Hacking (MLH) Campus, Postman Student Leaders, Solana Campus Ambassadors, AWS Student Ambassador.',
  },
  {
    priority: '1B',
    name: 'Residencies, Fellowships & Research',
    focus: 'Technical fellowships, independent builder stipends, AI research cohorts, grant programs, and founder residencies for emerging engineers and builders.',
    examples: 'Thiel Fellowship, Emergent Ventures, 1517 Fund, OpenAI Residency, Hugging Face Fellowship, South Park Commons Fellowship, Mozilla Tech Policy / Open Source Fellowships, Neo Scholar.',
  },
  {
    priority: '1C',
    name: 'Hackathons & Internships',
    focus: 'Major global virtual or hybrid hackathons with high-value prizes, open-source fellowship sprints, builder hackathons, and high-impact engineering student internships.',
    examples: 'Devpost featured hackathons, Devfolio hackathons, ETHGlobal, Solana Renaissance, LlamaIndex Hackathons, Google Summer of Code, MLH Member Hackathons.',
  },
  {
    priority: '2',
    name: 'Free Credits & Developer Perks',
    focus: 'Developer cloud credits, GPU vouchers, AI model API credits, free builder tier grants, and startup perks for individual software developers and student builders.',
    examples: 'Google for Startups Cloud credits, AWS Activate Founder, Microsoft for Startups Founders Hub, Together AI developer grants, Modal/Replicate compute credits, NVIDIA Inception, GitHub Student Developer Pack bonuses.',
  },
];

function cleanPromptText(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/"""/g, "'''")
    .replace(/[\u0000-\u001F]/g, ' ')
    .slice(0, maxLen)
    .trim();
}

export function buildRadarPrompt({ tier, arsenalProjects, seenUrls = [] }) {
  const projectsList = arsenalProjects.length > 0
    ? arsenalProjects
        .slice(0, 20)
        .map((p) => `- Project ID "${cleanPromptText(p.id, 60)}": """${cleanPromptText(p.title, 120)}""" (${(p.techStack || []).slice(0, 15).map((s) => cleanPromptText(s, 40)).join(', ')}). Context: """${cleanPromptText(p.contextBlurb || p.description || 'No context', 600)}"""`)
        .join('\n')
    : 'No projects registered in Arsenal yet.';

  const exclusions = seenUrls.length > 0
    ? `Do NOT include any of the following already-seen URLs:\n${seenUrls.slice(0, 30).map((u) => `- ${cleanPromptText(u, 300)}`).join('\n')}\n`
    : '';

  return `Discover and curate real, active, currently open or upcoming ${tier.name} opportunities in 2026/2027.

Category Details:
- Focus: ${tier.focus}
- Typical Programs: ${tier.examples}

User's Arsenal Projects (evaluate which project fits best if applicable):
${projectsList}

${exclusions}
STRICT REQUIREMENTS:
1. Provide accurate, verified official URLs and deadline information.
2. Return up to 8 high-quality, legitimate opportunities.
3. If an application deadline is announced, format it as ISO 8601 (e.g. "2026-05-01T23:59:59Z"). If rolling or unspecified, set "deadline": null.
4. If one of the user's Arsenal projects strongly fits the opportunity, set "recommendedProjectId" to that exact project ID, otherwise null.
5. Output ONLY a valid JSON array matching the schema below, enclosed in a single \`\`\`json markdown block. Do not add conversational text.

JSON Schema per item:
[
  {
    "title": "Program or Opportunity Name",
    "organization": "Hosting Company or Foundation",
    "type": "hackathon" | "fellowship" | "ambassador" | "waitlist" | "other",
    "url": "https://exact-source-url.com",
    "summary": "1-2 sentence technical summary of deliverables, perks, eligibility, and format.",
    "deadline": "ISO 8601 string or null",
    "source": "https://official-announcement-or-portal-link.com",
    "priority": "${tier.priority}",
    "recommendedProjectId": "project-id or null"
  }
]`;
}
