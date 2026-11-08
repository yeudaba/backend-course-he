// P25-E06: הגדרות מה־env — נוח בפיתוח, קשוח בפרודקשן
import { z } from "zod";

export interface Config {
  env: "development" | "test" | "production";
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export function loadConfig(env: Record<string, string | undefined>): Config {
  // כתוב כאן
  return { env: "development", port: 3000, databaseUrl: "", jwtSecret: "", logLevel: "info" };
}
