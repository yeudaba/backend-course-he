// P21-E36: redact — עותק בלי סודות, לפני שרושמים ללוג
const SENSITIVE = /password|token|secret|authorization|cookie/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] = SENSITIVE.test(key) ? "[REDACTED]" : redact(v);
  }
  return out;
}
