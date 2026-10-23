// Module responsible for coordinating plans, approvals, execution, cancellation, and rollback.

import crypto from 'node:crypto';
import type { AutomationRun, DashboardData } from '@oneintern/domain';
import { AutomationPlanner, ExecutionPolicy, RunStateMachine } from '@oneintern/domain';
import { getIntent, intents } from './catalog.js';
import type { RunRepository } from './repository.js';
import { AutomationRunner } from './runner.js';
import type { WorkspaceTool } from './tools.js';
import type { ScopedWorkspace } from './workspace.js';

export class AutomationService {
  private readonly machine = new RunStateMachine();
  private readonly planner: AutomationPlanner;
  private readonly runner: AutomationRunner;
  private readonly changedFiles = new Set<string>();

  constructor(
    private readonly repository: RunRepository,
    private readonly workspace: ScopedWorkspace,
    tools: Map<string, WorkspaceTool>,
  ) {
    this.planner = new AutomationPlanner(tools, new ExecutionPolicy());
    this.runner = new AutomationRunner(repository, workspace, tools);
  }

  dashboard(): DashboardData {
    const files = this.workspace.describeFiles(this.changedFiles);
    return {
      workspace: {
        name: 'demo-repo',
        root: 'runtime/workspaces/demo-repo',
        fileCount: files.length,
        changedFiles: files.filter((file) => file.status === 'changed').length,
      },
      policy: { allowed: 4, approvalRequired: 1, denied: 3 },
      intents,
      recentRuns: this.repository.list(8),
      recentEvents: this.repository.listEvents(12),
      files,
    };
  }

  plan(intentId: string): AutomationRun {
    const intent = getIntent(intentId);
    const steps = this.planner.create(intent);
    const requiresApproval = steps.some((step) => step.decision === 'approval_required');
    const timestamp = new Date().toISOString();
    const run: AutomationRun = {
      id: crypto.randomUUID(),
      intentId,
      intentName: intent.name,
      status: requiresApproval ? 'awaiting_approval' : 'planned',
      createdAt: timestamp,
      updatedAt: timestamp,
      requiresApproval,
      approvedAt: null,
      summary: null,
      steps,
      canExecute: !requiresApproval,
      canCancel: true,
      canRollback: false,
    };
    this.repository.create(run);
    this.repository.addEvent(
      run.id,
      'plan_created',
      `${intent.name} planned`,
      `${steps.length} steps evaluated.`,
    );
    return this.repository.get(run.id);
  }

  approve(runId: string): AutomationRun {
    const run = this.repository.get(runId);
    run.status = this.machine.transition(run.status, 'approved');
    run.approvedAt = new Date().toISOString();
    run.updatedAt = run.approvedAt;
    this.repository.update(run);
    this.repository.addEvent(
      run.id,
      'approval_granted',
      'Human approval recorded',
      'Write tools may execute once.',
    );
    return this.repository.get(run.id);
  }

  async execute(runId: string): Promise<AutomationRun> {
    const before = this.workspace.snapshot(
      this.workspace.listFiles().filter((file) => file.endsWith('.md')),
    );
    const result = await this.runner.execute(this.repository.get(runId));
    for (const [file, content] of Object.entries(before)) {
      if (this.workspace.read(file) !== content) this.changedFiles.add(file);
    }
    return result;
  }

  cancel(runId: string): AutomationRun {
    const run = this.repository.get(runId);
    run.status = this.machine.transition(run.status, 'cancelled');
    run.summary = 'Cancelled before workspace execution.';
    run.updatedAt = new Date().toISOString();
    this.repository.update(run);
    this.repository.addEvent(
      run.id,
      'run_cancelled',
      'Run cancelled',
      'No tool executed.',
    );
    return this.repository.get(run.id);
  }

  rollback(runId: string): AutomationRun {
    const run = this.repository.get(runId);
    const snapshot = this.repository.getSnapshot(runId);
    this.workspace.restore(snapshot);
    run.status = this.machine.transition(run.status, 'rolled_back');
    run.summary = `${Object.keys(snapshot).length} Markdown snapshots restored.`;
    run.updatedAt = new Date().toISOString();
    this.repository.update(run);
    for (const file of Object.keys(snapshot)) this.changedFiles.delete(file);
    this.repository.addEvent(
      run.id,
      'rollback_completed',
      'Workspace restored',
      run.summary,
    );
    return this.repository.get(run.id);
  }
}
