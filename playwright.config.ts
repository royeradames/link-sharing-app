import { defineConfig } from "@playwright/test"
// PW_PORT lets a shared build host run the suite on a free port.
const port = Number(process.env.PW_PORT ?? 4392)
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [
    ["list"],
    ["json", { outputFile: ".test-state/browser-results.json" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    channel: "chrome",
    viewport: { width: 1280, height: 900 },
    trace: "off",
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 30000,
  },
})
