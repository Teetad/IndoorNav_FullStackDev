import { defineConfig } from "cypress";
import "dotenv/config";

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    FRONTEND_URL: process.env.FRONTEND_URL,
    BACKEND_URL: process.env.BACKEND_URL,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
