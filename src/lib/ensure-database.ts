import "server-only";

import { auth } from "@/lib/auth";
import { databasePool, isDatabaseConfigured } from "@/lib/database";

let migrationPromise: Promise<void> | undefined;

export function ensureDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error("Accounts are unavailable because DATABASE_URL is not configured.");
  }

  migrationPromise ??= runMigrations().catch((error) => {
    migrationPromise = undefined;
    throw error;
  });

  return migrationPromise;
}

async function runMigrations() {
  const context = await auth.$context;
  await context.runMigrations();

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS "workout_user_data" (
      "user_id" TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
      "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
      "version" INTEGER NOT NULL DEFAULT 1,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
