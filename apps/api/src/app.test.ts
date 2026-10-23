// Module responsible for verifying guarded API workflows against isolated local resources.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AutomationRun } from '@oneintern/domain';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppContext } from './app.js';
import { createApp } from './app.js';

describe('1ntern API', () => {
  let context: AppContext;
  let directory: string;

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oneintern-'));
    context = await createApp({
      databasePath: path.join(directory, 'test.db'),
      workspaceRoot: path.join(directory, 'workspace'),
      port: 0,
      resetOnStart: true,
      logLevel: 'silent',
    });
  });

  afterEach(async () => {
    await context.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  it('executes a read-only release plan without approval', async () => {
    const planned = await context.app.inject({
      method: 'POST',
      url: '/api/runs',
      payload: { intentId: 'release_readiness' },
    });
    const run = planned.json<AutomationRun>();
    expect(run.status).toBe('planned');
    const executed = await context.app.inject({
      method: 'POST',
      url: `/api/runs/${run.id}/execute`,
    });
    expect(executed.json<AutomationRun>().status).toBe('succeeded');
  });

  it('blocks a write plan until approval and supports rollback', async () => {
    const planned = await context.app.inject({
      method: 'POST',
      url: '/api/runs',
      payload: { intentId: 'docs_hygiene' },
    });
    const run = planned.json<AutomationRun>();
    const blocked = await context.app.inject({
      method: 'POST',
      url: `/api/runs/${run.id}/execute`,
    });
    expect(blocked.statusCode).toBe(409);
    await context.app.inject({ method: 'POST', url: `/api/runs/${run.id}/approve` });
    const executed = await context.app.inject({
      method: 'POST',
      url: `/api/runs/${run.id}/execute`,
    });
    expect(executed.json<AutomationRun>().canRollback).toBe(true);
    const rolledBack = await context.app.inject({
      method: 'POST',
      url: `/api/runs/${run.id}/rollback`,
    });
    expect(rolledBack.json<AutomationRun>().status).toBe('rolled_back');
  });

  it('cancels an approved plan before any tool runs', async () => {
    const planned = await context.app.inject({
      method: 'POST',
      url: '/api/runs',
      payload: { intentId: 'docs_hygiene' },
    });
    const run = planned.json<AutomationRun>();
    await context.app.inject({ method: 'POST', url: `/api/runs/${run.id}/approve` });
    const cancelled = await context.app.inject({
      method: 'POST',
      url: `/api/runs/${run.id}/cancel`,
    });
    expect(cancelled.json<AutomationRun>().status).toBe('cancelled');
  });

  it('rejects unsupported intents', async () => {
    const response = await context.app.inject({
      method: 'POST',
      url: '/api/runs',
      payload: { intentId: 'run_any_shell_command' },
    });
    expect(response.statusCode).toBe(409);
  });
});
