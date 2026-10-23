// Module responsible for verifying deterministic policy-aware plan creation.

import { describe, expect, it } from 'vitest';
import { AutomationPlanner } from './planner.js';
import { ExecutionPolicy } from './policy.js';

describe('AutomationPlanner', () => {
  it('preserves tool order and annotates approvals', () => {
    const tools = new Map([
      [
        'inspect',
        {
          id: 'inspect',
          title: 'Inspect',
          description: 'Read',
          risk: 'read' as const,
          writesWorkspace: false,
        },
      ],
      [
        'format',
        {
          id: 'format',
          title: 'Format',
          description: 'Write',
          risk: 'write' as const,
          writesWorkspace: true,
        },
      ],
    ]);
    const plan = new AutomationPlanner(tools, new ExecutionPolicy()).create({
      id: 'docs',
      name: 'Docs',
      description: 'Prepare docs',
      outcome: 'Clean docs',
      toolIds: ['inspect', 'format'],
    });
    expect(plan.map((step) => step.toolId)).toEqual(['inspect', 'format']);
    expect(plan[1]?.decision).toBe('approval_required');
  });
});
