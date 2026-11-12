// P21-E89: loadConfig — בדיקה אחת של ה־env, בעלייה
import { z } from "zod";

export type AppConfig = { jwtSecret: string; accessTtlSeconds: number; refreshTtlDays: number; bcryptRounds: number };

const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(30).max(3600).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
});

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const r = envSchema.safeParse(env);
  if (!r.success) {
    const bad = new Set(r.error.issues.map((i) => String(i.path[0])));
    const names = Object.keys(envSchema.shape).filter((k) => bad.has(k));
    throw new Error(`הגדרות לא תקינות: ${names.join(", ")}`);
  }
  const e = r.data;
  return {
    jwtSecret: e.JWT_SECRET,
    accessTtlSeconds: e.ACCESS_TOKEN_TTL_SECONDS,
    refreshTtlDays: e.REFRESH_TOKEN_TTL_DAYS,
    bcryptRounds: e.BCRYPT_ROUNDS,
  };
}
