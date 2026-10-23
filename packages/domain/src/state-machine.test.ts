// Module responsible for verifying legal automation run lifecycle transitions.

import { describe, expect, it } from 'vitest';
import { RunStateMachine } from './state-machine.js';

describe('RunStateMachine', () => {
  const machine = new RunStateMachine();

  it('supports approval and execution', () => {
    expect(machine.transition('awaiting_approval', 'approved')).toBe('approved');
    expect(machine.transition('approved', 'running')).toBe('running');
  });

  it('rejects execution before approval', () => {
    expect(() => machine.transition('awaiting_approval', 'running')).toThrow(
      'Invalid run transition',
    );
  });

  it('allows rollback only from a terminal execution state', () => {
    expect(machine.canTransition('succeeded', 'rolled_back')).toBe(true);
    expect(machine.canTransition('planned', 'rolled_back')).toBe(false);
  });
});
