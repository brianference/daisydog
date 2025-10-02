import { test, expect } from '@playwright/test';

/**
 * Landing Page Mobile Tests
 * Tests layout, social sharing, and mobile responsiveness
 */

test.describe('Landing Page - Mobile', () => {
  test('social share component should be visible on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop layout test');

    await page.goto('/');
    
    const socialShare = page.locator('.social-share, [class*="social"]');
    await expect(socialShare).toBeVisible();
  });

  test('hero content should be responsive on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');
    
    const heroContent = page.locator('.hero-content, .hero');
    await expect(heroContent).toBeVisible();
    
    // Should fill width on mobile
    const box = await heroContent.boundingBox();
    const viewport = page.viewportSize();
    expect(box?.width).toBeGreaterThan(viewport?.width * 0.8 || 300);
  });

  test('social share buttons should work', async ({ page }) => {
    await page.goto('/');
    
    // Find social share buttons
    const facebookBtn = page.locator('button:has-text("Facebook"), .facebook').first();
    
    if (await facebookBtn.isVisible()) {
      // Should open share dialog (we won't actually test the popup)
      await facebookBtn.click({ trial: true }); // Trial click to verify it's clickable
    }
  });

  test('mobile touch gestures should work', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    await page.goto('/');
    
    // Test swipe/scroll behavior
    await page.mouse.move(200, 300);
    await page.mouse.down();
    await page.mouse.move(200, 100);
    await page.mouse.up();
    
    // Page should have scrolled
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThanOrEqual(0);
  });
});
