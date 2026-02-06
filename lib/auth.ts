import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
  database: new Database("database.sqlite"),
  emailAndPassword: { enabled: true },
  experimental: { joins: true },
  plugins: [nextCookies()],
});
