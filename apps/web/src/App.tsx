// Module responsible for coordinating navigation and guarded workflow actions.

import { useEffect, useState } from 'react';
import { api } from './api';
import { MissionControl } from './components/MissionControl';
import { AuditView, PolicyView, RunsView } from './components/SecondaryViews';
import { Shell } from './components/Shell';
import type { Dashboard, Run, ViewId } from './types';

export default function App() {
  const [view, setView] = useState<ViewId>('control');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => setDashboard(await api.dashboard());
  useEffect(() => {
    void refresh().catch((caught: unknown) => setError(message(caught)));
  }, []);

  const act = async (operation: () => Promise<Run>) => {
    setBusy(true);
    setError(null);
    try {
      setRun(await operation());
      await refresh();
    } catch (caught) {
      setError(message(caught));
    } finally {
      setBusy(false);
    }
  };

  if (!dashboard) return <div className="boot-state">Preparing the local workspace…</div>;
  return (
    <Shell view={view} onNavigate={setView}>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}
      {view === 'control' && (
        <MissionControl
          dashboard={dashboard}
          run={run}
          busy={busy}
          onPlan={(id) => void act(() => api.plan(id))}
          onApprove={() => run && void act(() => api.approve(run.id))}
          onExecute={() => run && void act(() => api.execute(run.id))}
          onCancel={() => run && void act(() => api.cancel(run.id))}
          onRollback={() => run && void act(() => api.rollback(run.id))}
        />
      )}
      {view === 'runs' && <RunsView dashboard={dashboard} />}
      {view === 'policy' && <PolicyView />}
      {view === 'audit' && <AuditView dashboard={dashboard} />}
    </Shell>
  );
}

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
