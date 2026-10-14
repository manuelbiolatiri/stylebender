import { expect, test } from '@playwright/test';

test.describe('Stylebender guest shell', () => {
  test('landing page presents the main occasions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Discover your style/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Church/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Office Day/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Date Night/i })).toBeVisible();
  });

  test('occasion selection updates the next styling move', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Date Night/i }).click();
    await expect(page.getByRole('heading', { name: /Style me for Date Night/i })).toBeVisible();
  });

  test('verdict actions open achieve and elevate flows', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Achieve this look/i }).click();
    await expect(page.getByRole('heading', { name: /Achieve this look/i })).toBeVisible();
    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /^Elevate$/i }).last().click();
    await expect(page.getByRole('heading', { name: /Elevate my look/i })).toBeVisible();
  });

  test('profile preferences persist locally', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Profile/i }).first().click();
    await page.getByRole('button', { name: /Streetwear/i }).click();
    await page.getByRole('button', { name: /Save my profile/i }).click();
    await page.reload();
    await page.getByRole('button', { name: /Profile/i }).first().click();
    await expect(page.getByRole('button', { name: /Streetwear/i })).toHaveClass(/bg-forest/);
  });

  test('Style IQ records progress', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Explore Style IQ/i }).click();
    await page.getByRole('button', { name: /Forest overshirt/i }).click();
    await expect(page.getByText(/Texture and tonal contrast/i)).toBeVisible();
  });

  test('auth views remain reachable', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await page.goto('/sign-up');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });
});
