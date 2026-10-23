// Module responsible for turning supported intents into policy-evaluated execution plans.

import { ExecutionPolicy } from './policy.js';
import type { AutomationIntent, PlanStep, ToolDefinition } from './types.js';

export class AutomationPlanner {
  constructor(
    private readonly tools: Map<string, ToolDefinition>,
    private readonly policy: ExecutionPolicy,
  ) {}

  create(intent: AutomationIntent): PlanStep[] {
    return intent.toolIds.map((toolId, index) => {
      const tool = this.tools.get(toolId);
      if (!tool) throw new Error(`Unknown tool: ${toolId}`);
      const policy = this.policy.evaluate(tool);
      return {
        id: `${index + 1}-${tool.id}`,
        order: index + 1,
        toolId: tool.id,
        title: tool.title,
        description: tool.description,
        risk: tool.risk,
        decision: policy.decision,
        reason: policy.reason,
        status: 'pending',
      };
    });
  }
}
