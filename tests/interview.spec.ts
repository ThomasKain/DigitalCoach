import { test, expect } from '@playwright/test';
import path from "path";

/**
 * Tests user's ability to start an interview.
 */
test('can start interview', async ({ page }) => {
  // Register
  await page.goto('http://localhost:3000/auth/login');
  await page.getByRole('link', { name: 'New user? sign up' }).click();
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('vivy@stevens.edu');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Testing@123');
  await page.locator('input[name="passwordConfirm"]').click();
  await page.locator('input[name="passwordConfirm"]').fill('Testing@123');
  await page.getByRole('button', { name: 'Register' }).click();
  
  
  // Login
  await page.waitForURL("**/register");
  const profilePicInput = page.locator("[name='avatar']");
  await expect(profilePicInput).toBeVisible({timeout: 10000});
  const fileInput = page.locator("input[type='file']");
  await expect(fileInput).toBeAttached(); // before inputting an image, we must wait for it to be attached to the DOM
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));
  
  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Vivy Doe');
  await page.getByRole('button', { name: 'sign up' }).click();
  await page.goto("http://localhost:3000");
  const heading = page.getByRole("heading", {level: 1});
  await expect(heading).toHaveText("Welcome back, Vivy Doe!");
  
  // Start interview
  await page.getByRole('link', { name: 'Natural Conversation' }).click();
  await page.goto('https://meet.livekit.io/custom?liveKitUrl=wss://heygen-feapbkvq.livekit.cloud&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzA2OTkyMTUsImlzcyI6IkFQSVByREUyNXZZRldERyIsIm5hbWUiOiJjbGllbnQiLCJuYmYiOjE3NzA2MTI4MTUsInN1YiI6ImNsaWVudCIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiI0YTExZTFjMC0wNTczLTExZjEtYmFiNC1iMjMxMzc5OWQxOTciLCJyb29tSm9pbiI6dHJ1ZX19.i9djsTddaCTO--O6NienIgBRX1LFgXPWydsR-LVBP2E');
  await expect(page.locator('.lk-participant-tile')).toBeVisible();
});

/**
 * Tests the user's ability to check their interview results.
 */
test('query interview results', async ({ page }) => {
  // Register
  await page.goto('http://localhost:3000/auth/login');
  await page.getByRole('link', { name: 'New user? sign up' }).click();
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('emmafrost@stevens.edu');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Querying!123');
  await page.locator('input[name="passwordConfirm"]').click();
  await page.locator('input[name="passwordConfirm"]').fill('Querying!123');
  await page.getByRole('button', { name: 'Register' }).click();
  
  // Login
  await page.waitForURL("**/register");
  const profilePicInput = page.locator("[name='avatar']");
  await expect(profilePicInput).toBeVisible({timeout: 10000});
  const fileInput = page.locator("input[type='file']");
  await expect(fileInput).toBeAttached(); // before inputting an image, we must wait for it to be attached to the DOM
  await fileInput.setInputFiles(path.join(__dirname, "profilePic.jpg"));

  await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Emma Frost');
  await page.getByRole('button', { name: 'sign up' }).click();
  await page.goto("http://localhost:3000");
  const heading = page.getByRole("heading", {level: 1});
  await expect(heading).toHaveText("Welcome back, Emma Frost!");

  // Request interview results
  await page.getByRole('link', { name: 'Progress Tracking' }).click();
  await expect(page.getByText('Data received: {"name":"Emma').first()).toBeVisible();
});