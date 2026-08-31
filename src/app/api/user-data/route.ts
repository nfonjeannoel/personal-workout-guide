import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { databasePool } from "@/lib/database";
import { ensureDatabase } from "@/lib/ensure-database";
import { emptyTrainingData } from "@/lib/training-data";

export const runtime = "nodejs";

const loggedSetSchema = z.object({ reps: z.number().int().min(0).max(100).nullable(), rir: z.number().int().min(0).max(10).nullable(), completed: z.boolean() });
const performanceSchema = z.object({ id: z.string().max(120), performedAt: z.string().max(40), weight: z.string().max(100), sets: z.array(loggedSetSchema).max(20), notes: z.string().max(2_000).optional() });
const exerciseRecordSchema = z.object({ favorite: z.boolean(), notes: z.string().max(5_000), history: z.array(performanceSchema).max(100), updatedAt: z.string().max(40) });
const journalExerciseLogSchema = z.object({ exerciseSlug: z.string().max(120), weight: z.string().max(100), sets: z.array(loggedSetSchema).max(20), notes: z.string().max(2_000).optional(), updatedAt: z.string().max(40) });
const workoutSchema = z.object({
  id: z.string().max(160),
  daySlug: z.string().max(80),
  weekKey: z.string().max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startedAt: z.string().max(40).optional(),
  completedExercises: z.array(z.string().max(120)).max(30),
  exerciseLogs: z.record(z.string().max(120), journalExerciseLogSchema).optional(),
  notes: z.string().max(5_000).optional(),
  feeling: z.enum(["rough", "steady", "strong"]).optional(),
  completedAt: z.string().max(40).optional(),
  updatedAt: z.string().max(40),
});
const swapSchema = z.object({ id: z.string().max(240), originalSlug: z.string().max(120), replacementSlug: z.string().max(120), daySlug: z.string().max(80).optional(), swappedAt: z.string().max(40) });
const payloadSchema = z.object({ data: z.object({
  version: z.number().int().min(1).max(10),
  exercises: z.record(z.string().max(120), exerciseRecordSchema),
  workouts: z.array(workoutSchema).max(250),
  swaps: z.array(swapSchema).max(250),
  recent: z.array(z.string().max(120)).max(12),
  settings: z.object({ timerSound: z.boolean() }),
  updatedAt: z.string().max(40),
}) });

async function currentUserId() {
  await ensureDatabase();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
}

export async function GET() {
  try {
    const userId = await currentUserId();
    if (!userId) return Response.json({ error: "Sign in required" }, { status: 401 });
    const result = await databasePool.query<{ data: unknown; version: number; updated_at: Date }>(
      'SELECT "data", "version", "updated_at" FROM "workout_user_data" WHERE "user_id" = $1',
      [userId],
    );
    const row = result.rows[0];
    return Response.json({ data: row?.data ?? emptyTrainingData(), version: row?.version ?? 0, updatedAt: row?.updated_at?.toISOString() ?? null });
  } catch (error) {
    console.error("Unable to load workout data", error);
    return Response.json({ error: "Unable to load workout data" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await currentUserId();
    if (!userId) return Response.json({ error: "Sign in required" }, { status: 401 });
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 1_000_000) return Response.json({ error: "Workout data is too large" }, { status: 413 });
    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid workout data" }, { status: 400 });
    const result = await databasePool.query<{ version: number; updated_at: Date }>(`
      INSERT INTO "workout_user_data" ("user_id", "data", "version", "updated_at")
      VALUES ($1, $2::jsonb, 1, NOW())
      ON CONFLICT ("user_id") DO UPDATE
      SET "data" = EXCLUDED."data", "version" = "workout_user_data"."version" + 1, "updated_at" = NOW()
      RETURNING "version", "updated_at"
    `, [userId, JSON.stringify(parsed.data.data)]);
    return Response.json({ ok: true, version: result.rows[0].version, updatedAt: result.rows[0].updated_at.toISOString() });
  } catch (error) {
    console.error("Unable to save workout data", error);
    return Response.json({ error: "Unable to save workout data" }, { status: 503 });
  }
}
