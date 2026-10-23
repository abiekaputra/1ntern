// Module responsible for framing product navigation and local-boundary context.

import type { ViewId } from '../types';
import { AuditIcon, ControlIcon, RunsIcon, ShieldIcon } from './icons';

const navigation = [
  { id: 'control' as const, label: 'Mission control', icon: ControlIcon },
  { id: 'runs' as const, label: 'Runs', icon: RunsIcon },
  { id: 'policy' as const, label: 'Policy', icon: ShieldIcon },
  { id: 'audit' as const, label: 'Audit trail', icon: AuditIcon },
];

interface ShellProps {
  view: ViewId;
  onNavigate: (view: ViewId) => void;
  children: React.ReactNode;
}

export function Shell({ view, onNavigate, children }: ShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" role="img" aria-label="1ntern" />
          <div>
            <strong>1ntern</strong>
            <span>Guarded automation</span>
          </div>
        </div>
        <nav aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="boundary-card">
          <span className="pulse" />
          <div>
            <strong>Local boundary active</strong>
            <span>No shell, network, or parent access</span>
          </div>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
