import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL ?? "http://localhost:3000",
    OAUTH_TEST_USERNAME: process.env.OAUTH_TEST_USERNAME,
    OAUTH_TEST_PASSWORD: process.env.OAUTH_TEST_PASSWORD ?? "1234567890",
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.ts",
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
