// P24-E20
type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SECRET = /^(password|passwordhash|token|accesstoken|refreshtoken|authorization|cookie|secret)$/i;

function redact(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(redact);
  if (v === null || typeof v !== "object") return v;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SECRET.test(k) ? "[REDACTED]" : redact(x)]));
}

export function createLogger({ level = "info", sink }: { level?: Level; sink: (line: string) => void }) {
  const write = (lvl: Level, msg: string, fields: Record<string, unknown> = {}) => {
    // תקלה 1: "error" < "info" כמחרוזות (e לפני i) — שגיאות נזרקו! משווים מספרים
    if (ORDER[lvl] < ORDER[level]) return;
    // תקלה 2: רק password בשורש. { user: { password } } עבר כמו שהוא — עכשיו בכל עומק
    sink(JSON.stringify({ level: lvl, msg, ...(redact(fields) as Record<string, unknown>) }));
  };
  return {
    debug: (msg: string, f?: Record<string, unknown>) => write("debug", msg, f),
    info: (msg: string, f?: Record<string, unknown>) => write("info", msg, f),
    warn: (msg: string, f?: Record<string, unknown>) => write("warn", msg, f),
    error: (msg: string, f?: Record<string, unknown>) => write("error", msg, f),
  };
}

export function logRequest(logger: ReturnType<typeof createLogger>, req: { method: string; url: string }, status: number) {
  // תקלה 3: req.url כולל query — /reset?token=… נכתב ללוג. רק הנתיב
  logger.info("request", { method: req.method, path: req.url.split("?")[0], status });
}
