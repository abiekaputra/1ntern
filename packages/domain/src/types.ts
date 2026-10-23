// Module responsible for defining automation workflow contracts shared across 1ntern.

export type RiskLevel = 'read' | 'write' | 'blocked';
export type PolicyDecision = 'allowed' | 'approval_required' | 'denied';
export type RunStatus =
  | 'planned'
  | 'awaiting_approval'
  | 'approved'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';
export type StepStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';

export interface AutomationIntent {
  id: string;
  name: string;
  description: string;
  outcome: string;
  toolIds: string[];
}

export interface PlanStep {
  id: string;
  order: number;
  toolId: string;
  title: string;
  description: string;
  risk: RiskLevel;
  decision: PolicyDecision;
  reason: string;
  status: StepStatus;
}

export interface AutomationRun {
  id: string;
  intentId: string;
  intentName: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  requiresApproval: boolean;
  approvedAt: string | null;
  summary: string | null;
  steps: PlanStep[];
  canExecute: boolean;
  canCancel: boolean;
  canRollback: boolean;
}

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  risk: RiskLevel;
  writesWorkspace: boolean;
}

export interface AuditEvent {
  id: number;
  runId: string | null;
  type: string;
  message: string;
  detail: string;
  createdAt: string;
}

export interface WorkspaceFile {
  path: string;
  bytes: number;
  status: 'clean' | 'changed';
}

export interface DashboardData {
  workspace: { name: string; root: string; fileCount: number; changedFiles: number };
  policy: { allowed: number; approvalRequired: number; denied: number };
  intents: AutomationIntent[];
  recentRuns: AutomationRun[];
  recentEvents: AuditEvent[];
  files: WorkspaceFile[];
}
