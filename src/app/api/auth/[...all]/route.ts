import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { ensureDatabase } from "@/lib/ensure-database";
import { isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  if (!isDatabaseConfigured() && new URL(request.url).pathname.endsWith("/get-session")) {
    return Response.json(null);
  }
  try {
    await ensureDatabase();
    return handlers.GET(request);
  } catch (error) {
    console.error("Authentication database initialization failed", error);
    return Response.json({ error: "Accounts are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    return handlers.POST(request);
  } catch (error) {
    console.error("Authentication database initialization failed", error);
    return Response.json({ error: "Accounts are temporarily unavailable." }, { status: 503 });
  }
}
