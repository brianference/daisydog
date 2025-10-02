import { defineConfig, devices } from '@playwright/test';

/**
 * Extended Playwright Configuration for DaisyDog
 * Focus: Automated safety filter testing, visual regression, CI/CD
 * Cost: FREE forever
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './reports' }],
    ['json', { outputFile: './reports/results.json' }],
    ['junit', { outputFile: './reports/junit.xml' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices - iOS
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    // Mobile devices - Android
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Galaxy S9',
      use: { ...devices['Galaxy S9+'] },
    },

    // Visual regression viewports
    {
      name: 'mobile-portrait',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'tablet-portrait',
      use: { 
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'desktop-1080p',
      use: { 
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'desktop-1440p',
      use: { 
        viewport: { width: 2560, height: 1440 }
      },
    },
  ],

  // CI/CD Integration
  webServer: process.env.CI ? {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  } : undefined,
});
