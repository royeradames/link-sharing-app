import { defineConfig } from "@playwright/test"
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
    baseURL: "http://127.0.0.1:4392",
    channel: "chrome",
    viewport: { width: 1280, height: 900 },
    trace: "off",
  },
  webServer: {
    command: "npm run start -- --port 4392",
    url: "http://127.0.0.1:4392",
    reuseExistingServer: false,
    timeout: 30000,
  },
})
