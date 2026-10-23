// Module responsible for capturing verified 1ntern product states as JPG evidence.

import { chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:4500';
const output = path.resolve('docs/images');
fs.mkdirSync(output, { recursive: true });

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: path.join(output, name),
    type: 'jpeg',
    quality: 90,
    fullPage: true,
  });
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
await desktop.goto(baseUrl);
await desktop.getByRole('button', { name: /Documentation hygiene/i }).click();
await desktop.getByText('awaiting approval', { exact: true }).waitFor();
await capture(desktop, '01-approval-boundary.jpg');
await desktop.getByRole('button', { name: 'Approve write step' }).click();
await desktop.getByText('approved', { exact: true }).waitFor();
await desktop.getByRole('button', { name: 'Run guarded plan' }).click();
await desktop.getByText('succeeded', { exact: true }).waitFor();
await capture(desktop, '02-execution-result.jpg');
await desktop.getByRole('button', { name: 'Rollback changes' }).click();
await desktop.getByText('rolled back', { exact: true }).waitFor();
await desktop.getByRole('button', { name: 'Audit trail' }).click();
await capture(desktop, '03-audit-trail.jpg');
await desktop.getByRole('button', { name: 'Policy' }).click();
await capture(desktop, '04-policy-model.jpg');
await desktop.getByRole('button', { name: 'Runs' }).click();
await capture(desktop, '05-run-history.jpg');

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(baseUrl);
await capture(mobile, '06-responsive-control.jpg');
await browser.close();
