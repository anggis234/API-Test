import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["./src/utils/step-reporter.ts"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "https://petstore.swagger.io/v2",
    extraHTTPHeaders: {
      api_key: process.env.API_KEY || "special-key",
      Accept: "application/json",
    },
    trace: "on-first-retry",
  },
});
