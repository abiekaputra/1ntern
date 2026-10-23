// Module responsible for evaluating tool risk against 1ntern's execution policy.

import type { PolicyDecision, RiskLevel, ToolDefinition } from './types.js';

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
}

export class ExecutionPolicy {
  evaluate(tool: ToolDefinition): PolicyResult {
    if (tool.risk === 'blocked') {
      return {
        decision: 'denied',
        reason: 'The tool exceeds the local low-risk automation boundary.',
      };
    }
    if (tool.risk === 'write' || tool.writesWorkspace) {
      return {
        decision: 'approval_required',
        reason: 'Workspace mutations require explicit human approval.',
      };
    }
    return {
      decision: 'allowed',
      reason: 'Read-only tools may run inside the scoped workspace.',
    };
  }

  summarize(risks: RiskLevel[]): PolicyDecision {
    if (risks.includes('blocked')) return 'denied';
    if (risks.includes('write')) return 'approval_required';
    return 'allowed';
  }
}
