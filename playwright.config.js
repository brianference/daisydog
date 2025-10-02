import { defineConfig, devices } from '@playwright/test';

/**
 * Mobile Testing Configuration for DaisyDog
 * Tests across iOS Safari, Android Chrome, and desktop browsers
 * 
 * Run tests: npm run test:mobile
 * Run specific device: npx playwright test --project="iPhone 15"
 */

export default defineConfig({
  testDir: './tests/mobile',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Mobile Safari - iOS Testing
    {
      name: 'iPhone 15 Pro',
      use: { 
        ...devices['iPhone 15 Pro'],
        // iOS Safari specific settings
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },

    // Mobile Chrome - Android Testing
    {
      name: 'Pixel 7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Galaxy S23',
      use: { ...devices['Galaxy S23'] },
    },
    {
      name: 'Galaxy Tab S4',
      use: { ...devices['Galaxy Tab S4'] },
    },

    // Desktop browsers for comparison
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});
