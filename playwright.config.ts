// Module responsible for configuring 1ntern browser validation.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4600',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @oneintern/api serve',
      url: 'http://127.0.0.1:4601/health',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ONEINTERN_DATABASE_PATH: './runtime/e2e.db',
        ONEINTERN_WORKSPACE_ROOT: './runtime/workspaces/e2e-repo',
        ONEINTERN_API_PORT: '4601',
        ONEINTERN_LOG_LEVEL: 'warn',
        ONEINTERN_RESET_ON_START: 'true',
      },
    },
    {
      command: 'pnpm --filter @oneintern/web serve:e2e',
      url: 'http://127.0.0.1:4600',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_API_PROXY_TARGET: 'http://127.0.0.1:4601' },
    },
  ],
});
