import { defineConfig, devices } from '@playwright/test'

const HOST = '127.0.0.1'
const PORT = 3000
const isCI = !!process.env.CI

// E2E runs against the production build (what users get). Locally, an already-running server on
// the port (e.g. `bun run dev`) is reused for a fast loop. CI always builds (D-29).
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    // Deterministic tests: motion-v drops movement under reduced motion (see .claude/rules/animations.md).
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Chromium only for now. Add Firefox/WebKit before release, since PDF iframe viewers differ (D-29).
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run build && bun run preview',
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: { HOST, PORT: String(PORT), NITRO_HOST: HOST, NITRO_PORT: String(PORT) },
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
