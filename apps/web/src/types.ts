// Module responsible for declaring browser-facing 1ntern data contracts.

export type ViewId = 'control' | 'runs' | 'policy' | 'audit';
export type RunStatus =
  | 'planned'
  | 'awaiting_approval'
  | 'approved'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';

export interface Intent {
  id: string;
  name: string;
  description: string;
  outcome: string;
  toolIds: string[];
}

export interface Step {
  id: string;
  order: number;
  toolId: string;
  title: string;
  description: string;
  risk: 'read' | 'write' | 'blocked';
  decision: 'allowed' | 'approval_required' | 'denied';
  reason: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
}

export interface Run {
  id: string;
  intentId: string;
  intentName: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  requiresApproval: boolean;
  approvedAt: string | null;
  summary: string | null;
  steps: Step[];
  canExecute: boolean;
  canCancel: boolean;
  canRollback: boolean;
}

export interface AuditEvent {
  id: number;
  runId: string | null;
  type: string;
  message: string;
  detail: string;
  createdAt: string;
}

export interface Dashboard {
  workspace: { name: string; root: string; fileCount: number; changedFiles: number };
  policy: { allowed: number; approvalRequired: number; denied: number };
  intents: Intent[];
  recentRuns: Run[];
  recentEvents: AuditEvent[];
  files: Array<{ path: string; bytes: number; status: 'clean' | 'changed' }>;
}
