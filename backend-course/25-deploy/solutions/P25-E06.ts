// P25-E06
import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV !== "production") return;
    if (!e.DATABASE_URL) ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "חובה בפרודקשן" });
    if (!e.JWT_SECRET || e.JWT_SECRET.length < 32) ctx.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "בפרודקשן — לפחות 32 תווים" });
    if (e.LOG_LEVEL === "debug") ctx.addIssue({ code: "custom", path: ["LOG_LEVEL"], message: "debug בפרודקשן כותב יותר מדי (ולפעמים מידע רגיש)" });
  });

export interface Config {
  env: "development" | "test" | "production";
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export function loadConfig(env: Record<string, string | undefined>): Config {
  const r = schema.safeParse(env);
  if (!r.success) {
    // כל הבעיות בהודעה אחת — לא "תקן אחת, deploy, גלה את הבאה"
    throw new Error(`הגדרות לא תקינות:\n${r.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  const e = r.data;
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    // בפיתוח בלבד: ברירות מחדל נוחות. בפרודקשן הן לא יגיעו לכאן — superRefine כבר נכשל
    databaseUrl: e.DATABASE_URL ?? "postgresql://postgres@localhost:5432/dev",
    jwtSecret: e.JWT_SECRET ?? "dev-only-secret-not-for-production!!",
    logLevel: e.LOG_LEVEL,
  };
}
