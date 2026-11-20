// P29-E40: מפתחות שלא דולפים ללוג
const SECRET = new Set(["apikey", "authorization", "x-api-key"]);

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/sk-ant-[\w-]+/g, "sk-ant-***");
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (value !== null || typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = SECRET.has(k.toLowerCase()) ? "***" : redactSecrets(v);
    return out;
  }
  return value;
}
