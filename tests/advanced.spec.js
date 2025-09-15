const { test, expect } = require('@playwright/test');

test.describe('Advanced Testing Examples', () => {
  test('api mocking example', async ({ page }) => {
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ])
      });
    });

    await page.goto('https://jsonplaceholder.typicode.com/users');
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('waiting for network requests', async ({ page }) => {
    await page.goto('https://httpbin.org/delay/2');

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/delay/2') && response.status() === 200
    );

    await page.reload();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
  });

  test('screenshot comparison', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('mobile viewport testing', async ({ page, context }) => {
    await context.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://playwright.dev/');

    const menuButton = page.getByRole('button', { name: 'Navigation menu' });
    await expect(menuButton).toBeVisible();
  });

  test('cookies and storage', async ({ page, context }) => {
    await page.goto('https://httpbin.org/cookies/set?tutorial=playwright');

    const cookies = await context.cookies();
    const tutorialCookie = cookies.find(cookie => cookie.name === 'tutorial');

    expect(tutorialCookie?.value).toBe('playwright');
  });
});