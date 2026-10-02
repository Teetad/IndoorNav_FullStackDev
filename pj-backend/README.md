# Indoor Navigation Backend

## Setup
- cd pj-backend
- Make `.env` from `.env.example`.
- Install dependencies: `pnpm install`
- Start PostgreSQL: `docker compose up -d postgres`
- Run migrations: `pnpm db:migrate`
- Import map data: `pnpm seed:maps --apply`
- Start the backend: `pnpm dev`
- Add the CPE OAuth credentials to `.env`.
- The API runs at `http://localhost:3000`

## Containerization

- Make `.env` from `.env.example`.
- Run `docker compose up -d --force-recreate --build`
- Import map data: `docker compose exec backend pnpm seed:maps --apply`
- The containerized API runs at `http://localhost:3000`

## Test

- Health check: `GET http://localhost:3000/health/database`
- Frontend OAuth login: open `http://localhost:3000/auth/login` in a browser.
- Backend-only OAuth test: open `http://localhost:3000/auth/login?mode=json` to receive a Bearer token.
- Frontend requests that use the session must send credentials (cookies).
- Add CMU emails to `ADMIN_EMAILS` or `DEVELOPER_EMAILS` before their first login.
- Open `bruno/` in Bruno and select the `Local` environment.
- Run `Map Verification` requests in order from 01 to 09.

## Build

- Run `pnpm build`
