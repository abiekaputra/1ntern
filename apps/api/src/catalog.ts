// Module responsible for declaring the supported low-risk automation intents.

import type { AutomationIntent } from '@oneintern/domain';

export const intents: AutomationIntent[] = [
  {
    id: 'docs_hygiene',
    name: 'Documentation hygiene',
    description:
      'Inspect documentation, repair safe formatting drift, and verify the result.',
    outcome: 'Consistent Markdown with a reversible workspace change.',
    toolIds: ['inventory', 'markdown_links', 'normalize_markdown', 'quality_snapshot'],
  },
  {
    id: 'release_readiness',
    name: 'Release readiness',
    description:
      'Inspect links, maintenance markers, and code hygiene without changing files.',
    outcome: 'A traceable read-only release health snapshot.',
    toolIds: ['inventory', 'markdown_links', 'todo_scan', 'quality_snapshot'],
  },
  {
    id: 'maintenance_triage',
    name: 'Maintenance triage',
    description:
      'Map the repository and surface work markers for the next human decision.',
    outcome: 'A focused list of visible maintenance evidence.',
    toolIds: ['inventory', 'todo_scan'],
  },
];

export function getIntent(intentId: string): AutomationIntent {
  const intent = intents.find((item) => item.id === intentId);
  if (!intent) throw new Error('Unsupported automation intent.');
  return intent;
}
