/**
 * This config is used by the better-auth CLI for migrations.
 * Uses better-sqlite3 since the CLI runs with Node.js, not Bun.
 *
 * Run migrations: bun x @better-auth/cli@latest migrate --config auth.config.ts
 */
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database("database.sqlite"),
  emailAndPassword: { enabled: true },
  experimental: { joins: true },
});
