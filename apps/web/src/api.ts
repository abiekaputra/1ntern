// Module responsible for communicating with the local 1ntern API.

import type { Dashboard, Run } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const init: RequestInit = { ...options };
  if (options?.body) {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    init.headers = headers;
  }
  const response = await fetch(`/api${path}`, init);
  const body = (await response.json()) as T | { error: string };
  if (!response.ok) {
    throw new Error(
      'error' in (body as object) ? (body as { error: string }).error : 'Request failed.',
    );
  }
  return body as T;
}

export const api = {
  dashboard: () => request<Dashboard>('/dashboard'),
  plan: (intentId: string) =>
    request<Run>('/runs', { method: 'POST', body: JSON.stringify({ intentId }) }),
  approve: (runId: string) => request<Run>(`/runs/${runId}/approve`, { method: 'POST' }),
  execute: (runId: string) => request<Run>(`/runs/${runId}/execute`, { method: 'POST' }),
  cancel: (runId: string) => request<Run>(`/runs/${runId}/cancel`, { method: 'POST' }),
  rollback: (runId: string) =>
    request<Run>(`/runs/${runId}/rollback`, { method: 'POST' }),
};
