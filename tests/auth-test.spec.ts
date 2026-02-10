import { test, expect } from '@playwright/test';
import path from "path";
/**
 * Tests user's ability to register an account and login. The register information isn't random so make sure the created account is deleted or non-existant in Firebase Authentication service before every run.
 */
test('can register and login', async ({ page }) => {
  // Register
  await page.goto('http://localhost:3000/auth/login');
  await page.getByRole('link', { name: 'New user? sign up' }).click();
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('student@stevens.edu');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('ILoveStevens@2026');
  await page.locator('input[name="passwordConfirm"]').click();
  await page.locator('input[name="passwordConfirm"]').fill('ILoveStevens@2026');
  await page.getByRole('button', { name: 'Register' }).click();

  // Login
  await page.waitForURL("**/register")
  const profilePicInput = page.locator("[name='avatar']");
  await expect(profilePicInput).toBeVisible({timeout: 10000});
  const fileInput =  page.locator("input[type='file']");
  await expect(fileInput).toBeAttached(); // before inputting an image, we must wait for it to be attached to the DOM
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));

  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('John Doe');
  await page.getByRole('button', { name: 'sign up' }).click();
  await page.goto("http://localhost:3000");
  const heading = page.getByRole("heading", { level: 1});
  await expect(heading).toHaveText("Welcome back, John Doe!");
  
  // Logout
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});