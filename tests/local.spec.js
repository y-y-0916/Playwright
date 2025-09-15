const { test, expect } = require('@playwright/test');

test.describe('Local Sample Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright Tutorial/);
  });

  test('form submission works', async ({ page }) => {
    await page.getByLabel('名前:').fill('テストユーザー');
    await page.getByLabel('メールアドレス:').fill('test@example.com');
    await page.getByLabel('年齢:').fill('25');
    await page.getByLabel('国:').selectOption('japan');
    await page.getByLabel('メッセージ:').fill('これはテストメッセージです');

    await page.getByRole('button', { name: '送信' }).click();

    await expect(page.getByText('送信されたデータ:')).toBeVisible();
    await expect(page.getByText('name: テストユーザー')).toBeVisible();
    await expect(page.getByText('email: test@example.com')).toBeVisible();
  });

  test('clear button works', async ({ page }) => {
    await page.getByLabel('名前:').fill('テスト');
    await page.getByLabel('メールアドレス:').fill('test@example.com');

    await page.getByRole('button', { name: 'クリア' }).click();

    await expect(page.getByLabel('名前:')).toHaveValue('');
    await expect(page.getByLabel('メールアドレス:')).toHaveValue('');
  });

  test('dynamic list item addition', async ({ page }) => {
    const initialItems = await page.locator('#dynamicList li').count();

    await page.getByRole('button', { name: 'アイテム追加' }).click();

    const newItemCount = await page.locator('#dynamicList li').count();
    expect(newItemCount).toBe(initialItems + 1);

    await expect(page.getByText('アイテム 3')).toBeVisible();
  });

  test('table row deletion', async ({ page }) => {
    await page.on('dialog', dialog => dialog.accept());

    const initialRows = await page.locator('#dataTable tbody tr').count();

    await page.getByRole('button', { name: '削除' }).first().click();

    const newRowCount = await page.locator('#dataTable tbody tr').count();
    expect(newRowCount).toBe(initialRows - 1);
  });

  test('async data loading', async ({ page }) => {
    await page.getByRole('button', { name: 'データ読み込み' }).click();

    await expect(page.getByText('読み込み中...')).toBeVisible();

    await expect(page.getByText('読み込み完了!')).toBeVisible();
    await expect(page.getByText('読み込み中...')).not.toBeVisible();
  });

  test('background color change', async ({ page }) => {
    const initialColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    await page.getByRole('button', { name: '背景色変更' }).click();

    const newColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    expect(newColor).not.toBe(initialColor);
  });

  test('alert dialog handling', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('これはアラートです！');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'アラート表示' }).click();
  });

  test('form validation', async ({ page }) => {
    await page.getByRole('button', { name: '送信' }).click();

    const nameInput = page.getByLabel('名前:');
    const isInvalid = await nameInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});