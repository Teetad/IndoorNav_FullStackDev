import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  env: {
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL ?? "http://localhost:3000",
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.ts",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
