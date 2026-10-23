// Module responsible for presenting a plan and its guarded lifecycle controls.

import type { Run } from '../types';
import { CheckIcon, RotateIcon } from './icons';
import { DecisionBadge, StatusBadge } from './StatusBadge';

interface RunPanelProps {
  run: Run;
  busy: boolean;
  onApprove: () => void;
  onExecute: () => void;
  onCancel: () => void;
  onRollback: () => void;
}

export function RunPanel(props: RunPanelProps) {
  const { run, busy, onApprove, onExecute, onCancel, onRollback } = props;
  return (
    <section className="run-panel panel">
      <header className="panel-header">
        <div>
          <span className="eyebrow">Active run</span>
          <h2>{run.intentName}</h2>
        </div>
        <StatusBadge status={run.status} />
      </header>
      <div className="step-list">
        {run.steps.map((step) => (
          <article className="step" key={step.id}>
            <div className={`step-index step-${step.status}`}>
              {step.status === 'succeeded' ? <CheckIcon /> : step.order}
            </div>
            <div className="step-copy">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
            <DecisionBadge decision={step.decision} />
          </article>
        ))}
      </div>
      {run.summary && (
        <div className="run-summary">
          <strong>Result</strong>
          <span>{run.summary}</span>
        </div>
      )}
      <footer className="run-actions">
        {run.status === 'awaiting_approval' && (
          <button className="primary" disabled={busy} onClick={onApprove}>
            Approve write step
          </button>
        )}
        {run.canExecute && (
          <button className="primary" disabled={busy} onClick={onExecute}>
            {busy ? 'Running…' : 'Run guarded plan'}
          </button>
        )}
        {run.canCancel && (
          <button className="secondary" disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        )}
        {run.canRollback && (
          <button className="secondary" disabled={busy} onClick={onRollback}>
            <RotateIcon />
            Rollback changes
          </button>
        )}
      </footer>
    </section>
  );
}
