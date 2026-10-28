import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    launchOptions: { executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] },
    viewport: { width: 1440, height: 1050 },
  },
  reporter: 'list',
});
