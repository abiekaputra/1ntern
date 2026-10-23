// Module responsible for the primary intent-to-execution user journey.

import type { Dashboard, Run } from '../types';
import { ArrowIcon, ShieldIcon } from './icons';
import { RunPanel } from './RunPanel';

interface MissionControlProps {
  dashboard: Dashboard;
  run: Run | null;
  busy: boolean;
  onPlan: (intentId: string) => void;
  onApprove: () => void;
  onExecute: () => void;
  onCancel: () => void;
  onRollback: () => void;
}

export function MissionControl(props: MissionControlProps) {
  const { dashboard, run, busy, onPlan, onApprove, onExecute, onCancel, onRollback } =
    props;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Automation that knows its limits</span>
          <h1>
            Give the intern a task.
            <br />
            <em>Keep the final say.</em>
          </h1>
          <p>
            1ntern plans low-risk repository work, exposes every tool decision, and pauses
            before changing a file.
          </p>
        </div>
        <div className="orbit-graphic" aria-label="Policy boundary visualization">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core">
            <span className="hero-mark" />
          </div>
          <span className="orbit-label label-read">read</span>
          <span className="orbit-label label-write">approve</span>
          <span className="orbit-label label-deny">deny</span>
        </div>
      </section>
      <section className="metric-grid" aria-label="Workspace status">
        <article>
          <span>Workspace</span>
          <strong>{dashboard.workspace.name}</strong>
          <small>{dashboard.workspace.fileCount} scoped files</small>
        </article>
        <article>
          <span>Policy</span>
          <strong>
            {dashboard.policy.allowed} / {dashboard.policy.approvalRequired} /{' '}
            {dashboard.policy.denied}
          </strong>
          <small>allow · approve · deny</small>
        </article>
        <article>
          <span>Changes</span>
          <strong>{dashboard.workspace.changedFiles}</strong>
          <small>reversible files</small>
        </article>
      </section>
      <div className="workspace-grid">
        <section className="intent-panel panel">
          <header className="panel-header">
            <div>
              <span className="eyebrow">Choose a mission</span>
              <h2>Safe work, clearly scoped</h2>
            </div>
            <ShieldIcon />
          </header>
          <div className="intent-list">
            {dashboard.intents.map((intent) => (
              <button key={intent.id} disabled={busy} onClick={() => onPlan(intent.id)}>
                <div>
                  <strong>{intent.name}</strong>
                  <span>{intent.description}</span>
                  <small>{intent.outcome}</small>
                </div>
                <ArrowIcon />
              </button>
            ))}
          </div>
        </section>
        {run ? (
          <RunPanel
            run={run}
            busy={busy}
            onApprove={onApprove}
            onExecute={onExecute}
            onCancel={onCancel}
            onRollback={onRollback}
          />
        ) : (
          <EmptyRun />
        )}
      </div>
    </>
  );
}

function EmptyRun() {
  return (
    <section className="empty-run panel">
      <div className="empty-glyph">1</div>
      <span className="eyebrow">No active run</span>
      <h2>Start with a plan</h2>
      <p>
        Choose a mission to see its tools, risk decisions, and approval boundary before
        anything executes.
      </p>
    </section>
  );
}
