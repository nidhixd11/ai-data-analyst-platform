import { test, expect } from '@playwright/test';

test('page loads and shows upload zone', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Data Analyst Platform/);
  await expect(page.getByText('Drop your CSV or Excel file')).toBeVisible();
});

test('browse files button is visible', async ({ page }) => {
  await page.goto('/');
  const browseButton = page.getByRole('button', { name: 'Browse files', exact: true });
  await expect(browseButton).toBeVisible();
});

test('suggestion pills are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Summarise growth')).toBeVisible();
});