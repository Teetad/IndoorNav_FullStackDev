import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema.js";
import { connectionString } from "@db/utils.js";

export const dbConn = postgres(connectionString);

export const dbClient = drizzle(dbConn, { schema, logger: true });
