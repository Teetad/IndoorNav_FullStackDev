import { config } from "dotenv";

config();
config({ path: "../.env", override: false });

const dbUser = process.env.POSTGRES_APP_USER;
const dbPassword = process.env.POSTGRES_APP_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const dbName = process.env.POSTGRES_DB;

if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbName) {
  throw new Error(
    "Invalid DB env. Set POSTGRES_APP_USER, POSTGRES_APP_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, and POSTGRES_DB.",
  );
}

export const connectionString = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
