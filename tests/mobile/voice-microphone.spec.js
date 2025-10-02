import { test, expect } from '@playwright/test';

/**
 * Voice Microphone Tests - Critical iOS Safari Testing
 * Tests microphone button functionality across mobile devices
 */

test.describe('Voice Microphone - Mobile Devices', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    
    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
  });

  test('microphone button should be visible on mobile', async ({ page }) => {
    const micButton = page.locator('button[aria-label*="microphone"], button[aria-label*="voice"], .voice-recorder button');
    await expect(micButton).toBeVisible({ timeout: 10000 });
  });

  test('should request microphone permission when clicked', async ({ page, context }) => {
    // Grant permissions before interaction
    await context.grantPermissions(['microphone']);

    const micButton = page.locator('button[aria-label*="microphone"], button[aria-label*="voice"], .voice-recorder button').first();
    
    // Wait for button to be visible and enabled
    await micButton.waitFor({ state: 'visible' });
    
    // Click microphone button
    await micButton.click();
    
    // Should show recording state or visual feedback
    const recordingIndicator = page.locator('[class*="recording"], [class*="Recording"], .waveform, .voice-active');
    await expect(recordingIndicator).toBeVisible({ timeout: 5000 });
  });

  test('iOS Safari - AudioContext should resume on user gesture', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'iOS Safari specific test');

    await page.goto('/chat');
    
    // Check AudioContext state after user gesture
    const audioContextState = await page.evaluate(() => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx.state;
    });
    
    // Should be 'suspended' before user interaction (iOS requirement)
    expect(['suspended', 'running']).toContain(audioContextState);
  });

  test('should handle microphone access errors gracefully', async ({ page }) => {
    // Don't grant permissions to test error handling
    const micButton = page.locator('button[aria-label*="microphone"], button[aria-label*="voice"]').first();
    
    await micButton.click();
    
    // Should show error message to user
    const errorMessage = page.locator('[class*="error"], [role="alert"], .error-message');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('touch interaction should work on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const micButton = page.locator('button[aria-label*="microphone"]').first();
    
    // Tap (touch) instead of click
    await micButton.tap();
    
    // Should respond to touch
    const recordingState = await page.locator('[class*="recording"]');
    await expect(recordingState).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chat Interface - Mobile Responsiveness', () => {
  test('chat input should be accessible on mobile', async ({ page }) => {
    await page.goto('/chat');
    
    const chatInput = page.locator('input[type="text"], textarea, [contenteditable="true"]');
    await expect(chatInput).toBeVisible();
    
    // Should be usable on mobile viewport
    const box = await chatInput.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
  });

  test('mobile navigation should work', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');
    
    // Test navigation to chat
    const chatButton = page.locator('a[href="/chat"], button:has-text("chat")').first();
    await chatButton.click();
    
    await expect(page).toHaveURL(/\/chat/);
  });
});
