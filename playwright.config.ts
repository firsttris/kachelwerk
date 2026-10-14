import { defineConfig, devices } from '@playwright/test';

// The demo page (demo/) with a fake hass: the cards' clicks in tests/cards.spec.ts, and the
// pictures for the README and the docs in tests/screenshots.spec.ts (npm run screenshots)
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    ...devices['Desktop Chrome'],
  },
  projects: [
    { name: 'cards', testIgnore: /screenshots\.spec\.ts/ },
    { name: 'screenshots', testMatch: /screenshots\.spec\.ts/ },
  ],
  webServer: {
    command: 'npx vite demo --config vite.config.ts --port 4300 --strictPort',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env.CI,
  },
});
