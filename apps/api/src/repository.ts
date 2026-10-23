// Module responsible for persisting runs, snapshots, and immutable audit events.

import type { DatabaseSync } from 'node:sqlite';
import type { AuditEvent, AutomationRun, PlanStep, RunStatus } from '@oneintern/domain';

interface RunRow {
  id: string;
  intent_id: string;
  intent_name: string;
  status: RunStatus;
  requires_approval: number;
  approved_at: string | null;
  summary: string | null;
  steps_json: string;
  snapshot_json: string | null;
  created_at: string;
  updated_at: string;
}

interface EventRow {
  id: number;
  run_id: string | null;
  type: string;
  message: string;
  detail: string;
  created_at: string;
}

function toRun(row: RunRow): AutomationRun {
  const status = row.status;
  return {
    id: row.id,
    intentId: row.intent_id,
    intentName: row.intent_name,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requiresApproval: row.requires_approval === 1,
    approvedAt: row.approved_at,
    summary: row.summary,
    steps: JSON.parse(row.steps_json) as PlanStep[],
    canExecute: status === 'planned' || status === 'approved',
    canCancel: ['planned', 'awaiting_approval', 'approved'].includes(status),
    canRollback: ['succeeded', 'failed'].includes(status) && row.snapshot_json !== null,
  };
}

export class RunRepository {
  constructor(private readonly database: DatabaseSync) {}

  create(run: AutomationRun): void {
    this.database
      .prepare(
        `INSERT INTO runs (
        id, intent_id, intent_name, status, requires_approval, approved_at, summary,
        steps_json, snapshot_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      )
      .run(
        run.id,
        run.intentId,
        run.intentName,
        run.status,
        run.requiresApproval ? 1 : 0,
        run.approvedAt,
        run.summary,
        JSON.stringify(run.steps),
        run.createdAt,
        run.updatedAt,
      );
  }

  get(id: string): AutomationRun {
    const row = this.database
      .prepare('SELECT * FROM runs WHERE id = ?')
      .get(id) as unknown as RunRow | undefined;
    if (!row) throw new Error('Automation run not found.');
    return toRun(row);
  }

  list(limit = 20): AutomationRun[] {
    const rows = this.database
      .prepare('SELECT * FROM runs ORDER BY created_at DESC LIMIT ?')
      .all(limit) as unknown as RunRow[];
    return rows.map(toRun);
  }

  update(run: AutomationRun): void {
    this.database
      .prepare(
        `UPDATE runs SET status = ?, approved_at = ?, summary = ?, steps_json = ?,
        updated_at = ? WHERE id = ?`,
      )
      .run(
        run.status,
        run.approvedAt,
        run.summary,
        JSON.stringify(run.steps),
        run.updatedAt,
        run.id,
      );
  }

  saveSnapshot(id: string, snapshot: Record<string, string>): void {
    this.database
      .prepare('UPDATE runs SET snapshot_json = ? WHERE id = ?')
      .run(JSON.stringify(snapshot), id);
  }

  getSnapshot(id: string): Record<string, string> {
    const row = this.database
      .prepare('SELECT snapshot_json FROM runs WHERE id = ?')
      .get(id) as unknown as { snapshot_json: string | null } | undefined;
    if (!row?.snapshot_json) throw new Error('No rollback snapshot exists for this run.');
    return JSON.parse(row.snapshot_json) as Record<string, string>;
  }

  addEvent(runId: string | null, type: string, message: string, detail: string): void {
    this.database
      .prepare(
        'INSERT INTO audit_events (run_id, type, message, detail, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(runId, type, message, detail, new Date().toISOString());
  }

  listEvents(limit = 30): AuditEvent[] {
    const rows = this.database
      .prepare('SELECT * FROM audit_events ORDER BY id DESC LIMIT ?')
      .all(limit) as unknown as EventRow[];
    return rows.map((row) => ({
      id: row.id,
      runId: row.run_id,
      type: row.type,
      message: row.message,
      detail: row.detail,
      createdAt: row.created_at,
    }));
  }
}
