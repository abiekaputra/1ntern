// Module responsible for validating guarded automation through the real browser interface.

import { expect, test } from '@playwright/test';

test('requires approval, executes a write plan, and rolls it back', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Give the intern a task/i }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Documentation hygiene/i }).click();
  await expect(page.getByText('awaiting approval', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run guarded plan' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Approve write step' }).click();
  await expect(page.getByText('approved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run guarded plan' }).click();
  await expect(page.getByText('succeeded', { exact: true })).toBeVisible();
  await expect(page.getByText('4 guarded steps completed.')).toBeVisible();
  await page.getByRole('button', { name: 'Rollback changes' }).click();
  await expect(page.getByText('rolled back', { exact: true })).toBeVisible();
});

test('runs read-only checks and exposes their audit evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Release readiness/i }).click();
  await expect(page.getByText('planned', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run guarded plan' }).click();
  await expect(page.getByText('succeeded', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Audit trail' }).click();
  await expect(page.getByRole('heading', { name: 'Audit trail' })).toBeVisible();
  await expect(page.getByText('Execution completed').first()).toBeVisible();
});

test('keeps the primary workflow usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /Documentation hygiene/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }),
  ).toBeVisible();
});
