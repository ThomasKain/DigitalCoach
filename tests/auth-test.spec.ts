import { test, expect } from '@playwright/test';

/**
 * Tests user's ability to register an account and login. The register information isn't random so make sure the created account is deleted or non-existant in Firebase Authentication service before every run.
 */
test('can register and login', async ({ page }) => {
  // Request profile picture from lorem picsum
  const response = await page.request.get("https://picsum.photos/400");
  const buffer = await response.body();

  await page.goto('http://localhost:3000/auth/login');
  await page.getByRole('link', { name: 'New user? sign up' }).click();
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('student@stevens.edu');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('ILoveStevens@2026');
  await page.locator('input[name="passwordConfirm"]').click();
  await page.locator('input[name="passwordConfirm"]').fill('ILoveStevens@2026');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  await page.locator("input[type='file']").setInputFiles({
    name: "profilePic",
    "mimeType": "image/jpeg",
    buffer: buffer,
  });
  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('John Doe');
  await page.getByRole('button', { name: 'sign up' }).click();
  await page.goto("localhost:3000");
  await expect(page.getByRole('heading', { name: 'Welcome back, John Doe!' })).toBeVisible();
});