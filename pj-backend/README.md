# Indoor Navigation Backend

Phase 1 provides Buildings, Floors, and Places APIs with Express, TypeScript,
PostgreSQL, and Drizzle ORM.

## Run locally

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm run db:migrate
pnpm run seed
pnpm run dev
```

The default local API URL is `http://localhost:3001` (from `PORT` in `.env`).

## API

- `GET|POST /buildings`
- `GET|DELETE /buildings/:building_id`
- `GET|POST /floors`
- `GET /floors/:building_id/:floor_number`
- `PUT|DELETE /floors/:floor_id`
- `GET|POST /places`
- `GET|PUT|DELETE /places/:place_id`
- `GET /places?search=lab`
- `GET /places?floor=6`
- `GET /places?building_id=:building_id`

Open `bruno/` in Bruno and select the `Local` environment for manual and
integration verification.

