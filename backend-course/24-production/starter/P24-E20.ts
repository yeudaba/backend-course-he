// P24-E20: logger עם שלוש תקלות. מצא ותקן — בלי לשנות את החתימות
type Level = "debug" | "info" | "warn" | "error";

export function createLogger({ level = "info", sink }: { level?: Level; sink: (line: string) => void }) {
  const write = (lvl: Level, msg: string, fields: Record<string, unknown> = {}) => {
    if (lvl < level) return;
    const safe: Record<string, unknown> = { ...fields };
    if ("password" in safe) safe.password = "[REDACTED]";
    sink(JSON.stringify({ level: lvl, msg, ...safe }));
  };
  return {
    debug: (msg: string, f?: Record<string, unknown>) => write("debug", msg, f),
    info: (msg: string, f?: Record<string, unknown>) => write("info", msg, f),
    warn: (msg: string, f?: Record<string, unknown>) => write("warn", msg, f),
    error: (msg: string, f?: Record<string, unknown>) => write("error", msg, f),
  };
}

export function logRequest(logger: ReturnType<typeof createLogger>, req: { method: string; url: string }, status: number) {
  logger.info("request", { method: req.method, path: req.url, status });
}
