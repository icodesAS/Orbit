import { ArsenalProject } from '@/lib/types';

export function createDemoProjects(nowMs: number): ArsenalProject[] {
  const hoursAgo = (h: number) => new Date(nowMs - h * 3600 * 1000).toISOString();

  return [
    {
      id: 'proj-sample-a',
      title: 'Sample Project A',
      description: 'SAMPLE: Autonomous test synthesis engine for multi-step agent verification.',
      contextBlurb:
        'Sample Project A is a fictional modular test synthesis engine that validates AI code generation against grammar invariants and isolated sandbox unit test suites in under 200ms. Designed for automated regression checks and CI self-healing.',
      techStack: ['TypeScript', 'Node.js', 'Docker', 'WebAssembly'],
      urls: [
        { label: 'Website', url: 'https://example.com/sample-project-a' },
        { label: 'Docs', url: 'https://example.com/sample-project-a/docs' },
      ],
      usedInCount: 4,
      createdAt: hoursAgo(300),
      updatedAt: hoursAgo(12),
    },
    {
      id: 'proj-sample-b',
      title: 'Sample Project B',
      description: 'SAMPLE: Lightweight telemetry and policy enforcement daemon for production pipelines.',
      contextBlurb:
        'Sample Project B is a fictional telemetry daemon that monitors agent tool calling and network boundaries using lightweight probes and policy rules. It reports execution latency, resource limits, and guardrail alerts with minimal overhead.',
      techStack: ['Go', 'gRPC', 'Next.js', 'PostgreSQL'],
      urls: [
        { label: 'Website', url: 'https://example.com/sample-project-b' },
        { label: 'Demo', url: 'https://example.com/sample-project-b/demo' },
      ],
      usedInCount: 3,
      createdAt: hoursAgo(400),
      updatedAt: hoursAgo(24),
    },
  ];
}
