# Indoor Navigation Backend

Phase 1 provides Buildings, Floors, and Places APIs with Express, TypeScript,
PostgreSQL, and Drizzle ORM.

## Run locally

```bash
cd pj-backend
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm run db:migrate
pnpm seed:maps --apply
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
- `GET /places?place_type=classroom`

Open `bruno/` in Bruno and select the `Local` environment for manual and
integration verification.

## Building 30 map data

`pnpm seed:maps` previews the floor 4–7 dataset without connecting to PostgreSQL.
`pnpm seed:maps --apply` imports it in a transaction without deleting existing data.
See [map sources and unresolved labels](db/data/README.md) before using the data.
`pnpm seed` is a destructive demo reset. Use `seed:maps --apply` for the map data.

## Verify map APIs in Bruno

1. Import the map data with `pnpm seed:maps --apply` and start the API with `pnpm dev`.
2. Open the `pj-backend/bruno` collection in Bruno and select the `Local` environment.
3. Run only the `Map Verification` folder, sequentially from 01 to 09.
   Request 01 discovers the building ID; request 07 discovers the place ID used by 08.
4. Expect HTTP 200 for requests 01–08 and HTTP 400 for request 09.
   Check the Tests results as well as the HTTP status.

All requests in this folder are read-only. Other folders include create/update/delete requests.
The map checks discover IDs dynamically; the older `seedPlaceId` variable belongs to demo data.
If Bruno CLI is installed, run from `pj-backend/bruno`:

```bash
bru run "Map Verification" --env Local
```
