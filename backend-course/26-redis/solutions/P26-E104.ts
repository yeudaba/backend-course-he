// P26-E104: config של Redis עם zod
import { z } from "zod";

const schema = z.object({
  REDIS_URL: z.string().regex(/^rediss?:\/\//, "חייב להתחיל ב־redis:// או rediss://").optional(),
  REDIS_PREFIX: z.string().regex(/^[a-z0-9_-]+$/i).default("shop"),
  PRODUCTS_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(60),
  ORDER_PAYMENT_TIMEOUT_SECONDS: z.coerce.number().int().min(1).default(1800),
  WORKER: z.enum(["true", "false"]).default("true"),
});

export function loadRedisConfig(env: Record<string, string | undefined>) {
  const r = schema.safeParse(env);
  if (!r.success) throw new Error(`הגדרות לא תקינות — ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  const e = r.data;
  return {
    ...(e.REDIS_URL ? { redis: { url: e.REDIS_URL, prefix: e.REDIS_PREFIX } } : {}),
    productsCacheTtlSeconds: e.PRODUCTS_CACHE_TTL_SECONDS,
    orderPaymentTimeoutSeconds: e.ORDER_PAYMENT_TIMEOUT_SECONDS,
    runWorker: e.WORKER === "true",
  };
}
