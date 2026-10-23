// Module responsible for presenting run and policy states consistently.

import type { RunStatus } from '../types';

export function StatusBadge({ status }: { status: RunStatus }) {
  return <span className={`status status-${status}`}>{status.replaceAll('_', ' ')}</span>;
}

export function DecisionBadge({ decision }: { decision: string }) {
  return (
    <span className={`decision decision-${decision}`}>
      {decision.replaceAll('_', ' ')}
    </span>
  );
}
