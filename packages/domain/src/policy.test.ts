// Module responsible for verifying risk decisions made by the execution policy.

import { describe, expect, it } from 'vitest';
import { ExecutionPolicy } from './policy.js';
import type { ToolDefinition } from './types.js';

const tool = (risk: ToolDefinition['risk'], writesWorkspace = false): ToolDefinition => ({
  id: risk,
  title: risk,
  description: risk,
  risk,
  writesWorkspace,
});

describe('ExecutionPolicy', () => {
  const policy = new ExecutionPolicy();

  it('allows read-only tools', () => {
    expect(policy.evaluate(tool('read')).decision).toBe('allowed');
  });

  it('requires approval for workspace writes', () => {
    expect(policy.evaluate(tool('write', true)).decision).toBe('approval_required');
  });

  it('denies tools beyond the product boundary', () => {
    expect(policy.evaluate(tool('blocked')).decision).toBe('denied');
  });
});
