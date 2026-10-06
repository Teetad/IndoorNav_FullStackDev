import type { FloorId } from "../Floor_Information";
import type { DestinationSide, Instruction, InstructionKind, RouteLeg } from "../types";
import { findPathLocal } from "./pathfinder";
import { planRoute } from "./planRoute";
import type { MapData } from "./planRoute";

/** One action in the route. Stairs only appear when the route changes floors. */
export type Action = Exclude<InstructionKind, "arrive">; // straight | left | right | uturn | stairs-up | stairs-down

/** Default response: just the actions, in order. */
export type RouteApiResponse = {
  from: string;
  to: string;
  /** Floors visited, in order. Each "stairs-*" action moves to the next floor in this list. */
  floors: FloorId[];
  instructions: Action[];
  /** Which side the destination is on when you arrive. */
  destinationSide: DestinationSide;
  /** Cells to walk on each floor. Only when includePath is true. */
  legs?: RouteLeg[];
};

/** Full response (detailed: true): titles, descriptions, step counts. */
export type RouteApiDetailedResponse = Omit<RouteApiResponse, "instructions"> & {
  totalSteps: number;
  instructions: Instruction[];
};

export type RouteApiResult =
  | { status: 200; body: RouteApiResponse | RouteApiDetailedResponse }
  | { status: 400 | 404 | 422; body: { error: string; code: string } };

export type RouteJsonRequestOptions = {
  /** Add the cell path of each floor (default false). Can also be set by ?includePath=true. */
  includePath?: boolean;
  /** Return titles, descriptions and step counts too (default false). Can also be set by ?detailed=true. */
  detailed?: boolean;
  floorLabel?: (id: FloorId) => string;
};

/**
 * Framework-free handler: map data + two room names in, HTTP status + JSON body out.
 * Wrap it in Express, Next, Hono, etc.
 */
export async function getRouteResponse(
  map: MapData & { width: number; height: number },
  from: string | undefined,
  to: string | undefined,
  options: {
    /** Add the cell path of each floor (default false). */
    includePath?: boolean;
    /** Return titles, descriptions and step counts too (default false). */
    detailed?: boolean;
    floorLabel?: (id: FloorId) => string;
  } = {}
): Promise<RouteApiResult> {
  if (!from?.trim() || !to?.trim()) {
    return { status: 400, body: { code: "missing_params", error: 'Both "from" and "to" are required.' } };
  }

  const result = await planRoute(
    map,
    from,
    to,
    (walls, start, goal) => findPathLocal(map.width, map.height, walls, start, goal),
    options.floorLabel
  );

  if (!result.ok) {
    return { status: result.code === "room_not_found" ? 404 : 422, body: { code: result.code, error: result.error } };
  }

  const { summary, directions } = result;
  const common = {
    from: summary.startRoom,
    to: summary.goalRoom,
    floors: summary.floors,
    destinationSide: directions.destinationSide,
    ...(options.includePath ? { legs: summary.legs } : null),
  };

  const steps = directions.instructions.filter((i) => i.kind !== "arrive");

  return {
    status: 200,
    body: options.detailed
      ? { ...common, totalSteps: directions.totalSteps, instructions: directions.instructions }
      : { ...common, instructions: steps.map((i) => i.kind as Action) },
  };
}

const truthy = (value: string | null) => value === "true" || value === "1";

const jsonResponse = (result: RouteApiResult) =>
  new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

/**
 * Request/Response wrapper for the route API.
 *
 * GET  /api/route?from=413A&to=411A&detailed=true
 * POST /api/route with JSON body { "from": "413A", "to": "411A", "includePath": true }
 */
export async function getRouteJsonResponse(
  map: MapData & { width: number; height: number },
  request: Request | URL | string,
  options: RouteJsonRequestOptions = {}
): Promise<Response> {
  const req = request instanceof Request ? request : null;
  const url = new URL(req?.url ?? request.toString(), "http://localhost");
  const method = req?.method.toUpperCase() ?? "GET";

  if (method !== "GET" && method !== "POST") {
    return new Response(JSON.stringify({ code: "method_not_allowed", error: "Use GET or POST." }), {
      status: 405,
      headers: {
        "Allow": "GET, POST",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  let body: { from?: unknown; to?: unknown; includePath?: unknown; detailed?: unknown } = {};
  if (method === "POST" && req) {
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ code: "invalid_json", error: "Request body must be valid JSON." }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  }

  const from = method === "POST" ? body.from : url.searchParams.get("from");
  const to = method === "POST" ? body.to : url.searchParams.get("to");
  const includePath = method === "POST" && typeof body.includePath === "boolean"
    ? body.includePath
    : truthy(url.searchParams.get("includePath"));
  const detailed = method === "POST" && typeof body.detailed === "boolean"
    ? body.detailed
    : truthy(url.searchParams.get("detailed"));

  return jsonResponse(await getRouteResponse(
    map,
    typeof from === "string" ? from : undefined,
    typeof to === "string" ? to : undefined,
    {
      ...options,
      includePath: options.includePath ?? includePath,
      detailed: options.detailed ?? detailed,
    }
  ));
}
