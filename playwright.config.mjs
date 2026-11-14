import { defineConfig } from '@playwright/test';

// RP_TEST_PORT erlaubt einen Testlauf gegen eine frische Serverinstanz, ohne einen bereits laufenden Server auf 5173 zu verwenden.
const port = Number(process.env.RP_TEST_PORT || 5173);

export default defineConfig({
  timeout: 60000,
  workers: 2,
  testDir: './tests',
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: 'npm run dev',
    env: { ...process.env, PORT: String(port) },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
  },
});
