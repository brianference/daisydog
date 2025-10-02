import { test, expect } from '@playwright/test';

test.describe('Contact Form and Footer Tests', () => {
  test('contact form should submit successfully', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.selectOption('select[name="category"]', 'technical');
    await page.fill('input[name="subject"]', 'Testing Contact Form');
    await page.fill('textarea[name="message"]', 'This is a test message to ensure the contact form works correctly.');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('h2:has-text("Message Sent Successfully")')).toBeVisible({ timeout: 10000 });
  });

  test('footer should be 100% width on all pages', async ({ page }) => {
    const pages = ['/', '/privacy', '/contact', '/about', '/faq'];
    
    for (const path of pages) {
      await page.goto(path);
      
      // Wait for footer to load
      const footer = page.locator('.app-footer');
      await footer.waitFor({ state: 'visible' });
      
      // Get footer width
      const footerBox = await footer.boundingBox();
      const viewportSize = page.viewportSize();
      
      // Footer should be full width
      expect(footerBox.width).toBe(viewportSize.width);
      
      console.log(`✅ ${path}: Footer width ${footerBox.width}px = Viewport ${viewportSize.width}px`);
    }
  });

  test('footer should have correct structure', async ({ page }) => {
    await page.goto('/');
    
    // Check footer components
    await expect(page.locator('.footer-links')).toBeVisible();
    await expect(page.locator('.footer-logo')).toBeVisible();
    await expect(page.locator('.footer-text')).toBeVisible();
    
    // Check footer links
    const links = page.locator('.footer-links a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(5); // Should have multiple links
  });
});
