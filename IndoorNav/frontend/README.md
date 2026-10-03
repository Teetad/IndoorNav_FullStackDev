# Indoor Pathfinding Map

A multi-floor indoor map for React + Vite. Pick two rooms and the app draws the
shortest walking path on the floor plan, including routes that change floors
through stairs.

It has two parts that share the same code:

- **Viewer / embed**: a plain map with no buttons or inputs. Rooms and floor are
  given by code or URL. Drop it into any page.
- **Editor**: a tool for drawing walls, tagging rooms and stairs, and placing
  start and goal points. Used by the map author, not by visitors.

---

## Quick start

```bash
npm install
npm run dev            # frontend (default http://localhost:5173)
```

The frontend asks a separate pathfinding server for the route, so that server
must be running too (see [Backend API](#backend-api)).

| URL |
|---|---|
| `/` | Test home page (`SHOW_TEST_HOME = true` in `src/main.tsx`) |

| `/?test` | Test home page, always |

| `/?from=401&to=305` | Plain map with the path from room 401 to room 305 |

| `/?from=401&to=305&floor=3` | Same route, forcing floor 3 to be shown |

| `/?to=305` | Path from the default start room (`DEFAULT_START_ROOM`) to 305 |

| `/?edit` | Editor (see [Editor access](#editor-access)) |

Room names are matched ignoring upper/lower case and surrounding spaces.

---

## Using the map in your own page

### React

```tsx
import { MapEmbed } from "./components/MapView";

// Fills the width of its parent; height follows
<div style={{ maxWidth: 900 }}>
  <MapEmbed startRoom="411B" goalRoom="411A" />
</div>

// Fills a box with a fixed height (width AND height)
<div style={{ height: 500 }}>
  <MapEmbed startRoom="411B" goalRoom="411A" fit="container" />
</div>
```

The path updates by itself whenever `startRoom` or `goalRoom` change.

### React Router

```tsx
<Route path="/map/:from/:to" element={<MapPage />} />

function MapPage() {
  const { from, to } = useParams();
  return <MapEmbed startRoom={from!} goalRoom={to!} />;
}
```

### A page that is not React

```html
<div id="map" style="max-width:900px"></div>
<script type="module">
  import { mountMap } from "/src/embed.tsx";

  const map = mountMap(document.getElementById("map"), {
    startRoom: "411B",
    goalRoom: "411A",
  });

  map.update({ startRoom: "411B", goalRoom: "305" }); // change the route later
  map.unmount();                                       // remove it
</script>
```

This example works with the Vite dev server. For production you would build
`src/embed.tsx` as a library bundle.

### Props

| Prop | Type | Description |
|---|---|---|
| `startRoom` | `string` | Room to start from (a room you tagged in the editor) |
| `goalRoom` | `string` | Room to go to. Empty means no path is drawn |
| `floor` | `string` | Floor to display, e.g. `"3"` or `"3F"`. Omitted means the start room's floor |
| `fit` | `"width"` \| `"container"` | Embedded size mode. `"container"` needs a parent with a fixed height |
| `onRouteReady` | `(floors) => void` | Floors the route passes through, e.g. `["4", "3"]` |
| `onError` | `(message) => void` | Room not found, no stairs, no path, etc. |
| `className`, `style` | | Applied to the wrapper div |
| `debug` | `boolean` | Shows a small status box under the map for troubleshooting |

`MapView` (default export) is the same component as a full page. `MapEmbed` is
`MapView` in embedded mode.

### Multi-floor routes

The map shows one floor at a time. For a route that changes floors, use
`onRouteReady` to learn which floors are involved, then change the `floor` prop
to step through them.

```tsx
const [floors, setFloors] = useState<string[]>([]);
const [floor, setFloor] = useState<string>();

<MapEmbed startRoom="411B" goalRoom="205" floor={floor} onRouteReady={setFloors} />
{floors.map((f) => <button key={f} onClick={() => setFloor(f)}>{f}F</button>)}
```

---

## Editing the map

Open the editor (`/?edit`), then for each floor:

1. **Edit Walls**: click cells to toggle walls.
2. **Tag Room**: click a cell and type a room number or name. Tag a cell that
   people can actually walk to (the app clears any wall on it).
3. **Tag Stairs**: mark stair cells. To connect two floors, mark the stairs at
   the **same x, y** on both floors. The router links floors only this way.
4. **Set Start / Set Goal**: for manual testing of a single floor.
5. Use **Copy Walls JSON** and **Copy Rooms + Stairs JSON**, then paste the
   results into `src/Floor_Information.ts`.

**Edits are not saved.** They live in the browser and disappear on refresh
until you copy the JSON into `Floor_Information.ts`. The viewer only shows what
is in that file.

If you want a default start point for visitors (an entrance or kiosk), tag that
cell as a room, for example `ENTRANCE`, and set `DEFAULT_START_ROOM` in
`src/main.tsx`.

### `Floor_Information.ts`

This file is yours to maintain. It must export:

| Export | Meaning |
|---|---|
| `WIDTH`, `HEIGHT` | Grid size in cells |
| `IMAGE_WIDTH`, `IMAGE_HEIGHT` | Floor plan image size in pixels |
| `FLOORS` | `[{ id, label, image }]`, one per floor |
| `INITIAL_WALLS_BY_FLOOR` | `{ [floorId]: [x, y][] }` |
| `INITIAL_STAIRS_BY_FLOOR` | `{ [floorId]: [x, y][] }` |
| `INITIAL_ROOMS_BY_FLOOR` | `{ [floorId]: { number, x, y }[] }` |
| `INITIAL_ENDPOINTS_BY_FLOOR` | `{ [floorId]: { start?, goal? } }` |

---

## Backend API

The frontend sends one request per floor leg:

```
POST {VITE_API_URL}/api/find-path        (default http://localhost:3001)
Content-Type: application/json

{
  "width": 40, "height": 25,
  "start": { "x": 3, "y": 4 },
  "goal":  { "x": 20, "y": 10 },
  "walls": [[1, 1], [1, 2]]
}
```

Response:

```json
{ "success": true, "path": [{ "x": 3, "y": 4 }, { "x": 4, "y": 4 }] }
```

When no route exists, return `"success": false`. `path` is an ordered list of
cells from start to goal, moving one cell at a time (up, down, left or right).

---

## Configuration

| Setting | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | `.env` | Address of the pathfinding server |
| `VITE_ENABLE_EDITOR` | `.env` | Set to `true` to allow `/?edit` in a production build |
| `SHOW_TEST_HOME` | `src/main.tsx` | `true` shows the test page at `/` |
| `DEFAULT_START_ROOM` | `src/main.tsx` | Start room used when the URL has no `from` |

### Editor access

The editor opens at `/?edit` only when:

- you run `npm run dev`, or
- the build was made with `VITE_ENABLE_EDITOR=true`.

A normal `npm run build` makes a viewer-only site where `?edit` does nothing.
This is a convenience lock, not real security, because the editor code is still
part of the bundle.

---

## Build and deploy

```bash
npm run build                              # viewer-only site (editor locked)
VITE_ENABLE_EDITOR=true npm run build      # includes the editor
```

Upload the `dist/` folder to any static host. The pathfinding server must also
be reachable from the browser: deploy it and build with
`VITE_API_URL=https://your-server`. Remember that `localhost` only exists on
your own computer.

---

## Troubleshooting

Add `debug` to the component to see what is happening:

```tsx
<MapEmbed startRoom="411B" goalRoom="411A" debug />
```
