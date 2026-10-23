// Module responsible for executing approved plans with timeouts and audit events.

import type { AutomationRun, PlanStep } from '@oneintern/domain';
import { RunStateMachine } from '@oneintern/domain';
import type { RunRepository } from './repository.js';
import type { WorkspaceTool } from './tools.js';
import type { ScopedWorkspace } from './workspace.js';

const toolTimeoutMs = 3_000;

async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), toolTimeoutMs);
  try {
    return await Promise.race([
      operation(controller.signal),
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener('abort', () =>
          reject(new Error('Tool timed out.')),
        ),
      ),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export class AutomationRunner {
  private readonly machine = new RunStateMachine();

  constructor(
    private readonly repository: RunRepository,
    private readonly workspace: ScopedWorkspace,
    private readonly tools: Map<string, WorkspaceTool>,
  ) {}

  async execute(run: AutomationRun): Promise<AutomationRun> {
    if (run.requiresApproval && run.status !== 'approved') {
      throw new Error('Explicit approval is required before execution.');
    }
    const next: AutomationRun = {
      ...run,
      status: this.machine.transition(run.status, 'running'),
      updatedAt: new Date().toISOString(),
      steps: run.steps.map((step) => ({ ...step })),
    };
    this.repository.update(next);
    this.repository.addEvent(
      run.id,
      'run_started',
      'Execution started',
      'Tool allowlist activated.',
    );

    const writableFiles = this.workspace
      .listFiles()
      .filter((file) => file.endsWith('.md'));
    if (run.steps.some((step) => step.risk === 'write')) {
      this.repository.saveSnapshot(run.id, this.workspace.snapshot(writableFiles));
    }

    try {
      for (const step of next.steps) await this.executeStep(next, step);
      next.status = this.machine.transition('running', 'succeeded');
      next.summary = `${next.steps.length} guarded steps completed.`;
      this.repository.addEvent(
        run.id,
        'run_succeeded',
        'Execution completed',
        next.summary,
      );
    } catch (error) {
      next.status = this.machine.transition('running', 'failed');
      next.summary = error instanceof Error ? error.message : 'Execution failed.';
      this.repository.addEvent(run.id, 'run_failed', 'Execution failed', next.summary);
    }
    next.updatedAt = new Date().toISOString();
    this.repository.update(next);
    return this.repository.get(next.id);
  }

  private async executeStep(run: AutomationRun, step: PlanStep): Promise<void> {
    const tool = this.tools.get(step.toolId);
    if (!tool) throw new Error(`Tool ${step.toolId} is unavailable.`);
    if (step.decision === 'denied') throw new Error(`Policy denied ${step.title}.`);
    step.status = 'running';
    run.updatedAt = new Date().toISOString();
    this.repository.update(run);
    const result = await withTimeout((signal) => tool.execute(this.workspace, signal));
    step.status = 'succeeded';
    this.repository.addEvent(run.id, 'tool_completed', result.summary, result.detail);
    this.repository.update(run);
  }
}
