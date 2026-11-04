import { defineConfig, devices } from "@playwright/test";

const PORT = 5347;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_ENABLE_MOCKS: "true", VITE_API_BASE_URL: "/api", VITE_SOCKET_URL: "http://localhost:3001" },
  },
});
