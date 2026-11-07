import { Global, Module } from "@nestjs/common";
import { z } from "zod";

// הגדרות מה־env, נבדקות פעם אחת בעלייה (פרק 20, E17). סוד חסר או קצר ← השרת לא עולה.
export const CONFIG = "CONFIG";
export const CLOCK = "CLOCK";

export interface Clock {
  now(): Date;
}

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, "לפחות 32 תווים אקראיים"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(30).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(7),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AUTH_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(10),
  IDEMPOTENCY_TTL_HOURS: z.coerce.number().int().min(1).default(24),
});

export interface AppConfig {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenTtlDays: number;
  bcryptRounds: number;
  logLevel: "debug" | "info" | "warn" | "error";
  authRateLimitPerMinute: number;
  idempotencyTtlHours: number;
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`הגדרות לא תקינות ב־.env — ${problems}`);
  }
  const e = result.data;
  return {
    jwtSecret: e.JWT_SECRET,
    accessTokenTtlSeconds: e.ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlDays: e.REFRESH_TOKEN_TTL_DAYS,
    bcryptRounds: e.BCRYPT_ROUNDS,
    logLevel: e.LOG_LEVEL,
    authRateLimitPerMinute: e.AUTH_RATE_LIMIT_PER_MINUTE,
    idempotencyTtlHours: e.IDEMPOTENCY_TTL_HOURS,
  };
}

// Global: כל module מקבל CONFIG ו־CLOCK בלי לייבא
@Global()
@Module({
  providers: [
    { provide: CONFIG, useFactory: () => loadConfig(process.env) },
    { provide: CLOCK, useValue: { now: () => new Date() } },
  ],
  exports: [CONFIG, CLOCK],
})
export class ConfigModule {}
