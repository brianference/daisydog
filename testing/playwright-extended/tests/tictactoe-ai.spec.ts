import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe AI Test', () => {
  test('AI should automatically take turn after player moves', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Click Start Chatting
    await page.getByRole('button', { name: /start chatting/i }).click();
    
    // Enter age
    await page.getByRole('spinbutton').fill('12');
    await page.getByRole('button', { name: /verify/i }).click();
    
    // Wait for age verification
    await page.waitForTimeout(1000);
    
    // Click Games button
    await page.getByRole('button', { name: /games/i }).click();
    
    // Click Tic-Tac-Toe
    await page.getByRole('button', { name: /tic-tac-toe/i }).click();
    
    // Wait for game to load
    await page.waitForSelector('.ttt-grid', { timeout: 5000 });
    
    // Take screenshot before move
    await page.screenshot({ path: '/tmp/before-move.png' });
    
    // Click center cell (index 4 = position [1,1])
    const cells = page.locator('.ttt-cell');
    await cells.nth(4).click();
    
    // Verify player's X appears
    await expect(cells.nth(4)).toContainText('✕');
    console.log('✅ Player placed X in center cell');
    
    // Wait for AI to respond (bot should take <2 seconds)
    await page.waitForTimeout(2500);
    
    // Take screenshot after AI move
    await page.screenshot({ path: '/tmp/after-ai-move.png' });
    
    // Count O's (Daisy's symbol)
    const oCount = await cells.filter({ hasText: '○' }).count();
    
    console.log(`AI placed ${oCount} O's`);
    
    // Verify AI made exactly 1 move
    expect(oCount).toBe(1);
    
    console.log('✅ TEST PASSED: AI successfully made a move!');
  });
});
