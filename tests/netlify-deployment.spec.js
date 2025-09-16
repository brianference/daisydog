import { test, expect } from '@playwright/test';

test.describe('Netlify Deployment Tests', () => {
  test('should load production site correctly', async ({ page }) => {
    await page.goto('https://daisydog.netlify.app/');
    
    // Verify site loads
    await expect(page).toHaveTitle(/Daisy/);
    await page.waitForLoadState('networkidle');
  });

  test('should load all images on production', async ({ page }) => {
    await page.goto('https://daisydog.netlify.app/chat');
    
    // Check header logo
    const headerLogo = page.locator('.daisy-avatar img');
    await expect(headerLogo).toBeVisible();
    
    // Verify image loads without 404
    const logoSrc = await headerLogo.getAttribute('src');
    const response = await page.request.get(`https://daisydog.netlify.app${logoSrc}`);
    expect(response.status()).toBe(200);
  });

  test('should have working chat functionality on production', async ({ page }) => {
    await page.goto('https://daisydog.netlify.app/chat');
    
    // Test name entry
    await page.fill('.message-input', 'TestUser');
    await page.click('.send-btn');
    
    // Wait for response
    await page.waitForSelector('.message.daisy:nth-child(3)', { timeout: 10000 });
    
    const response = page.locator('.message.daisy:nth-child(3) .message-bubble p');
    await expect(response).toContainText('TestUser! What a wonderful name!');
  });

  test('should have correct button styling on production', async ({ page }) => {
    await page.goto('https://daisydog.netlify.app/chat');
    
    const sendBtn = page.locator('.send-btn');
    await expect(sendBtn).toBeVisible();
    
    // Check button states work correctly
    await page.fill('.message-input', 'test');
    await sendBtn.hover();
    
    // Verify hover effect
    await expect(sendBtn).toHaveCSS('background-color', 'rgb(255, 165, 0)');
  });
});
