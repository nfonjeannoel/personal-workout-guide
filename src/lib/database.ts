import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDatabase = globalThis as unknown as {
  workoutDatabasePool?: Pool;
};

export const databasePool =
  globalForDatabase.workoutDatabasePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.workoutDatabasePool = databasePool;
}

export const database = drizzle(databasePool);

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
