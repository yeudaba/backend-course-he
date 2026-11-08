import { Global, Module } from "@nestjs/common";
import { z } from "zod";

export const CONFIG = "CONFIG";
export const CLOCK = "CLOCK";

export interface Clock {
  now(): Date;
}

const schema = z.object({
  JWT_SECRET: z.string().min(32, "לפחות 32 תווים אקראיים"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).default(3600),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  IDEMPOTENCY_TTL_HOURS: z.coerce.number().int().min(1).default(24),
  // מנהל ראשון: בעלייה, אם שניהם מוגדרים — המשתמש נוצר (או מקבל role admin)
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(12, "לפחות 12 תווים").optional(),
});

export interface AppConfig {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  bcryptRounds: number;
  idempotencyTtlHours: number;
  admin?: { email: string; password: string };
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const r = schema.safeParse(env);
  if (!r.success) {
    throw new Error(`הגדרות לא תקינות — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  const e = r.data;
  return {
    jwtSecret: e.JWT_SECRET,
    accessTokenTtlSeconds: e.ACCESS_TOKEN_TTL_SECONDS,
    bcryptRounds: e.BCRYPT_ROUNDS,
    idempotencyTtlHours: e.IDEMPOTENCY_TTL_HOURS,
    ...(e.ADMIN_EMAIL && e.ADMIN_PASSWORD ? { admin: { email: e.ADMIN_EMAIL.toLowerCase(), password: e.ADMIN_PASSWORD } } : {}),
  };
}

@Global()
@Module({
  providers: [
    { provide: CONFIG, useFactory: () => loadConfig(process.env) },
    { provide: CLOCK, useValue: { now: () => new Date() } },
  ],
  exports: [CONFIG, CLOCK],
})
export class ConfigModule {}
