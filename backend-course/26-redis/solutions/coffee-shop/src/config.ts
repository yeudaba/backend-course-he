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
  // פרק 26: Redis — רשות. בלעדיו: בלי cache, ומיילים נשלחים מיד (בלי תור)
  REDIS_URL: z.string().optional(),
  REDIS_PREFIX: z.string().regex(/^[a-z0-9_-]+$/i).default("shop"),
  PRODUCTS_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(60),
  ORDER_PAYMENT_TIMEOUT_SECONDS: z.coerce.number().int().min(1).default(1800),
  WORKER: z.enum(["true", "false"]).default("true"),
});

export interface AppConfig {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
  bcryptRounds: number;
  idempotencyTtlHours: number;
  admin?: { email: string; password: string };
  redis?: { url: string; prefix: string };
  productsCacheTtlSeconds: number;
  orderPaymentTimeoutSeconds: number;
  runWorker: boolean;
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
    ...(e.REDIS_URL ? { redis: { url: e.REDIS_URL, prefix: e.REDIS_PREFIX } } : {}),
    productsCacheTtlSeconds: e.PRODUCTS_CACHE_TTL_SECONDS,
    orderPaymentTimeoutSeconds: e.ORDER_PAYMENT_TIMEOUT_SECONDS,
    runWorker: e.WORKER === "true",
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
