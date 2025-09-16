import { test, expect } from '@playwright/test';

test.describe('Image Loading Tests', () => {
  test('should load Daisy logo in header', async ({ page }) => {
    await page.goto('/chat');
    
    const headerLogo = page.locator('.daisy-avatar img');
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo).toHaveAttribute('src', '/assets/images/daisy-logo.svg');
    
    // Verify image actually loads (not broken)
    const response = await page.request.get('/assets/images/daisy-logo.svg');
    expect(response.status()).toBe(200);
  });

  test('should load Daisy logo in chat messages', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for initial Daisy message
    await page.waitForSelector('.message.daisy');
    
    const messageLogo = page.locator('.message.daisy .message-avatar img');
    await expect(messageLogo).toBeVisible();
    await expect(messageLogo).toHaveAttribute('src', '/assets/images/daisy-logo.svg');
  });

  test('should load favicon correctly', async ({ page }) => {
    await page.goto('/');
    
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href', '/daisy-favicon.svg');
    
    // Verify favicon loads
    const response = await page.request.get('/daisy-favicon.svg');
    expect(response.status()).toBe(200);
  });

  test('should have proper button styling and states', async ({ page }) => {
    await page.goto('/chat');
    
    const sendBtn = page.locator('.send-btn');
    await expect(sendBtn).toBeVisible();
    
    // Check initial state (grey background, orange paw)
    await expect(sendBtn).toHaveCSS('background-color', 'rgb(204, 204, 204)');
    await expect(sendBtn).toHaveCSS('color', 'rgb(255, 165, 0)');
    
    // Type message to enable button
    await page.fill('.message-input', 'Hello Daisy');
    
    // Hover state should invert colors
    await sendBtn.hover();
    await expect(sendBtn).toHaveCSS('background-color', 'rgb(255, 165, 0)');
    await expect(sendBtn).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('should test name confirmation feature', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for initial greeting
    await page.waitForSelector('.message.daisy');
    
    // Enter a name
    await page.fill('.message-input', 'Alex');
    await page.click('.send-btn');
    
    // Wait for Daisy's response
    await page.waitForSelector('.message.daisy:nth-child(3)');
    
    const response = page.locator('.message.daisy:nth-child(3) .message-bubble p');
    await expect(response).toContainText('Alex! What a wonderful name!');
    await expect(response).toContainText('*tail wagging excitedly*');
  });
});
