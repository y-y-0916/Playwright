const { test, expect } = require('@playwright/test');

test.describe('Form Testing Examples', () => {
  test('login form example', async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/login');

    await page.getByLabel('Username').fill('practice');
    await page.getByLabel('Password').fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
  });

  test('form validation example', async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/form-validation');

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Please enter your contact number')).toBeVisible();
    await expect(page.getByText('Please enter your password')).toBeVisible();
  });

  test('file upload example', async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/upload');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(__dirname + '/../package.json');

    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.getByText('File Uploaded!')).toBeVisible();
  });
});