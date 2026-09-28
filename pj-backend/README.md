# Indoor Navigation Backend

## Setup

- Make `.env` from `.env.example`.
- Install dependencies: `pnpm install`
- Start PostgreSQL: `docker compose up -d postgres`
- Run migrations: `pnpm db:migrate`
- Import map data: `pnpm seed:maps --apply`
- Start the backend: `pnpm dev`
- The API runs at `http://localhost:3001`

## Containerization

- Make `.env` from `.env.example`.
- Run `docker compose up -d --force-recreate --build`
- Import map data: `docker compose exec backend pnpm seed:maps --apply`
- The containerized API runs at `http://localhost:3002`

## Test

- Health check: `GET http://localhost:3001/health/database`
- Open `bruno/` in Bruno and select the `Local` environment.
- Run `Map Verification` requests in order from 01 to 09.

## Build

- Run `pnpm build`
