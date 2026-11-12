// P24-E95: ההגדרות של שלב ז׳
import { z } from "zod";

const schema = z.object({
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AUTH_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(10),
  IDEMPOTENCY_TTL_HOURS: z.coerce.number().int().min(1).default(24),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

export function loadProductionConfig(env: Record<string, string | undefined>) {
  const result = schema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`הגדרות לא תקינות: ${problems}`);
  }
  const e = result.data;
  return {
    logLevel: e.LOG_LEVEL,
    authRateLimitPerMinute: e.AUTH_RATE_LIMIT_PER_MINUTE,
    idempotencyTtlHours: e.IDEMPOTENCY_TTL_HOURS,
    trustProxy: e.TRUST_PROXY,
  };
}

console.log(loadProductionConfig({ TRUST_PROXY: "1", HOME: "/root" }));
try {
  loadProductionConfig({ LOG_LEVEL: "verbose", AUTH_RATE_LIMIT_PER_MINUTE: "0" });
} catch (err) {
  console.log((err as Error).message.split("; ").length, "בעיות");
}
