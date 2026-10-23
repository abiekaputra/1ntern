// Module responsible for rendering run history, policy rules, and audit evidence.

import type { Dashboard } from '../types';
import { StatusBadge } from './StatusBadge';

export function RunsView({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Page
      title="Run history"
      intro="Every plan keeps its state, outcome, and approval context."
    >
      <div className="table-card panel">
        {dashboard.recentRuns.length === 0 ? (
          <Empty text="No runs yet. Start a mission from Mission control." />
        ) : (
          dashboard.recentRuns.map((run) => (
            <article className="history-row" key={run.id}>
              <div>
                <strong>{run.intentName}</strong>
                <span>{new Date(run.createdAt).toLocaleString()}</span>
              </div>
              <span>
                {run.steps.filter((step) => step.status === 'succeeded').length}/
                {run.steps.length} tools
              </span>
              <StatusBadge status={run.status} />
            </article>
          ))
        )}
      </div>
    </Page>
  );
}

export function PolicyView() {
  const rules = [
    [
      'Allowed',
      'Read-only inventory, link checks, marker scans, and hygiene measurement.',
      'allow',
    ],
    [
      'Approval required',
      'Deterministic Markdown normalization inside the scoped workspace.',
      'approve',
    ],
    [
      'Denied',
      'Arbitrary shell, network access, parent paths, secrets, and symbolic links.',
      'deny',
    ],
  ];
  return (
    <Page
      title="Execution policy"
      intro="The product boundary is explicit, finite, and visible before execution."
    >
      <div className="policy-grid">
        {rules.map(([title, copy, tone]) => (
          <article className={`policy-card panel tone-${tone}`} key={title}>
            <span>{tone}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </div>
      <section className="panel policy-detail">
        <span className="eyebrow">Enforcement model</span>
        <h2>Five adapters. One workspace. Zero arbitrary commands.</h2>
        <p>
          Tools are concrete classes behind a shared interface. The planner asks the
          policy engine for a decision, the state machine validates lifecycle changes, and
          the runner applies a timeout before each adapter executes.
        </p>
      </section>
    </Page>
  );
}

export function AuditView({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Page
      title="Audit trail"
      intro="Plans, approvals, tool results, failures, and rollbacks become durable local evidence."
    >
      <div className="audit-list panel">
        {dashboard.recentEvents.length === 0 ? (
          <Empty text="No audit events yet." />
        ) : (
          dashboard.recentEvents.map((event) => (
            <article key={event.id}>
              <span className="event-dot" />
              <div>
                <strong>{event.message}</strong>
                <p>{event.detail}</p>
              </div>
              <time>
                {new Date(event.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </article>
          ))
        )}
      </div>
    </Page>
  );
}

function Page({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">1ntern workspace</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {children}
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="empty-inline">{text}</div>;
}
