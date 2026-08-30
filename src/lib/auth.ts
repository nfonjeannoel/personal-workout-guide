import "server-only";

import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { databasePool } from "@/lib/database";

const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const authSecret = process.env.BETTER_AUTH_SECRET;

if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL && !authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required when accounts are enabled in production.");
}

export const auth = betterAuth({
  appName: "Form / Function",
  baseURL: siteUrl,
  database: databasePool,
  secret: authSecret ?? "local-build-only-secret-change-before-deploying-please",
  trustedOrigins: [siteUrl],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    storage: "database",
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9._-]+$/.test(value),
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
