# Setup

- Create `.env` from `.env.example`
- `pnpm install`
- `pnpm exec cypress install`
- `pnpm exec cypress verify`
- Start `pj-backend` and `pj-frontend`
- `pnpm run test` opens Cypress
- `pnpm run test:run` runs Cypress headlessly

# Setup from scratch

- See https://cmu.to/fullstack69

# What this tests

- `backend.cy.ts` checks the public backend health, read, validation, and guest-protected write behavior.
- `auth.cy.ts` checks OAuth login redirects, protected auth API behavior, logout, and optionally a real CPE OAuth login.
- `frontend.cy.ts` checks the main floor pages and room/category UI while stubbing the frontend's `http://localhost:3000` API calls.
- `min.cy.ts` checks the test environment wiring.

# Optional OAuth login test

- Add `OAUTH_TEST_USERNAME` to `testing/.env` to run the real browser login against `https://oauth497.cpecmu.com/`.
- `OAUTH_TEST_PASSWORD` defaults to `1234567890`.
- If `OAUTH_TEST_USERNAME` is empty, Cypress skips only the real OAuth login test; the backend auth API tests still run.

# Issue

- As of July 2026, Typescript 7 does not work with the current version of Cypress (15.18.1). Therefore, we are using Typescript 6.
