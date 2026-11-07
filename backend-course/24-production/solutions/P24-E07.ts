// P24-E07
const DEFAULT_KEYS = ["password", "passwordHash", "token", "accessToken", "refreshToken", "authorization", "cookie", "secret"];

export function redact(value: unknown, keys: string[] = DEFAULT_KEYS): unknown {
  const secret = new Set(keys.map((k) => k.toLowerCase()));
  const parents = new Set<object>(); // האובייקטים שבדרך אל הערך הנוכחי
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return v.replace(/^Bearer\s+\S+$/i, "Bearer [REDACTED]");
    if (v === null || typeof v !== "object") return v;
    if (v instanceof Date) return v.toISOString();
    if (parents.has(v)) return "[Circular]"; // אובייקט שמצביע על עצמו — אחרת רקורסיה אינסופית
    parents.add(v);
    const out = Array.isArray(v)
      ? v.map(walk)
      : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, secret.has(k.toLowerCase()) ? "[REDACTED]" : walk(x)]));
    parents.delete(v);
    return out;
  };
  return walk(value); // מחזירים עותק — את המקור לא משנים
}
