import { test, expect } from '@playwright/test';

test.describe('Board Games Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    
    // Fill age verification
    await page.waitForSelector('input[placeholder*="age"]', { timeout: 10000 });
    await page.fill('input[placeholder*="age"]', '10');
    await page.click('button:has-text("Continue")');
    
    // Wait for chat page to load
    await page.waitForSelector('.quick-actions-compact', { timeout: 10000 });
  });

  test('can open games menu and see featured games', async ({ page }) => {
    // Click Play Games button
    await page.click('button[data-tooltip="Play Games"]');
    
    // Wait for game selection menu
    await page.waitForSelector('text=🎮 Choose a Game!', { timeout: 5000 });
    
    // Verify featured games are present
    await expect(page.locator('text=🃏 Memory Match')).toBeVisible();
    await expect(page.locator('text=❌⭕ Tic-Tac-Toe')).toBeVisible();
    await expect(page.locator('text=🔴🟡 Connect Four')).toBeVisible();
    await expect(page.locator('text=🎲 More Games')).toBeVisible();
  });

  test('Memory Match - loads and displays game board', async ({ page }) => {
    // Open games menu
    await page.click('button[data-tooltip="Play Games"]');
    await page.waitForSelector('text=🃏 Memory Match');
    
    // Click Memory Match
    await page.click('text=🃏 Memory Match');
    
    // Wait for game to load
    await page.waitForSelector('.game-container', { timeout: 10000 });
    
    // Verify game elements
    await expect(page.locator('.memory-card')).toHaveCount(16, { timeout: 5000 });
    await expect(page.locator('text=Player Score')).toBeVisible();
  });

  test('Tic-Tac-Toe - loads and displays game board', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.waitForSelector('text=❌⭕ Tic-Tac-Toe');
    await page.click('text=❌⭕ Tic-Tac-Toe');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    
    // Verify 3x3 grid
    await expect(page.locator('.tictactoe-cell')).toHaveCount(9, { timeout: 5000 });
  });

  test('Connect Four - loads and displays game board', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.waitForSelector('text=🔴🟡 Connect Four');
    await page.click('text=🔴🟡 Connect Four');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    
    // Verify 7x6 grid (42 cells)
    await expect(page.locator('.connect-four-cell')).toHaveCount(42, { timeout: 5000 });
  });

  test('More Games - opens game selector with all 9 games', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.waitForSelector('text=🎲 More Games');
    await page.click('text=🎲 More Games');
    
    // Wait for game selector
    await page.waitForSelector('.game-selector', { timeout: 10000 });
    
    // Verify all 9 game cards are present
    await expect(page.locator('.game-card')).toHaveCount(9, { timeout: 5000 });
    
    // Verify game titles
    await expect(page.locator('text=Memory Match')).toBeVisible();
    await expect(page.locator('text=Tic-Tac-Toe')).toBeVisible();
    await expect(page.locator('text=Connect Four')).toBeVisible();
    await expect(page.locator('text=Checkers')).toBeVisible();
    await expect(page.locator('text=Go Fish')).toBeVisible();
    await expect(page.locator('text=Simple Puzzle')).toBeVisible();
    await expect(page.locator('text=Color Matching')).toBeVisible();
    await expect(page.locator('text=Pattern Builder')).toBeVisible();
    await expect(page.locator('text=Word Scramble')).toBeVisible();
  });

  test('Checkers - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    // Click Checkers card
    await page.click('.game-card:has-text("Checkers")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.checkers-board')).toBeVisible({ timeout: 5000 });
  });

  test('Go Fish - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    await page.click('.game-card:has-text("Go Fish")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.gofish-hand')).toBeVisible({ timeout: 5000 });
  });

  test('Simple Puzzle - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    await page.click('.game-card:has-text("Simple Puzzle")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.puzzle-piece')).toBeVisible({ timeout: 5000 });
  });

  test('Color Matching - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    await page.click('.game-card:has-text("Color Matching")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.color-sequence')).toBeVisible({ timeout: 5000 });
  });

  test('Pattern Builder - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    await page.click('.game-card:has-text("Pattern Builder")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.pattern-display')).toBeVisible({ timeout: 5000 });
  });

  test('Word Scramble - loads from game selector', async ({ page }) => {
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🎲 More Games');
    await page.waitForSelector('.game-selector');
    
    await page.click('.game-card:has-text("Word Scramble")');
    
    await page.waitForSelector('.game-container', { timeout: 10000 });
    await expect(page.locator('.scrambled-letters')).toBeVisible({ timeout: 5000 });
  });

  test('can exit game and return to chat', async ({ page }) => {
    // Start a game
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🃏 Memory Match');
    await page.waitForSelector('.game-container');
    
    // Click exit button
    await page.click('button:has-text("Exit")');
    
    // Verify back in chat
    await expect(page.locator('.quick-actions-compact')).toBeVisible({ timeout: 5000 });
  });

  test('modern theme is applied to all games', async ({ page }) => {
    // Check Memory Match
    await page.click('button[data-tooltip="Play Games"]');
    await page.click('text=🃏 Memory Match');
    await page.waitForSelector('.game-container');
    
    // Verify modern theme colors (primary: #2196F3)
    const container = await page.locator('.game-container');
    const styles = await container.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('--theme-primary');
    });
    
    expect(styles).toContain('#2196F3');
  });
});
