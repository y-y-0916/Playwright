const { test, expect } = require('@playwright/test');

test.describe('Basic Playwright Tutorial Tests', () => {
  test('has title', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('search functionality', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await page.getByPlaceholder('Search docs').click();
    await page.getByPlaceholder('Search docs').fill('locators');
    await page.getByPlaceholder('Search docs').press('Enter');
    await expect(page.getByText('Locators')).toBeVisible();
  });
});