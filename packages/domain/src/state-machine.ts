// Module responsible for validating automation run state transitions.

import type { RunStatus } from './types.js';

const transitions: Record<RunStatus, RunStatus[]> = {
  planned: ['awaiting_approval', 'running', 'cancelled'],
  awaiting_approval: ['approved', 'cancelled'],
  approved: ['running', 'cancelled'],
  running: ['succeeded', 'failed', 'cancelled'],
  succeeded: ['rolled_back'],
  failed: ['rolled_back'],
  cancelled: [],
  rolled_back: [],
};

export class RunStateMachine {
  canTransition(from: RunStatus, to: RunStatus): boolean {
    return transitions[from].includes(to);
  }

  transition(from: RunStatus, to: RunStatus): RunStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid run transition: ${from} -> ${to}`);
    }
    return to;
  }
}
