import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL: 'http://localhost:2000', trace: 'on-first-retry', screenshot: 'only-on-failure' },
  webServer: { command: 'yarn dev', url: 'http://localhost:2000', reuseExistingServer: false, timeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
