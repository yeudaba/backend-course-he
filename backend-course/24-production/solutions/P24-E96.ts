// P24-E96: שורת ה־request של הפרויקט
type Level = "debug" | "info" | "warn" | "error";

export function requestLogEntry(input: { method: string; originalUrl: string; status: number; durationMs: number; requestId: string; userId?: number }) {
  const path = input.originalUrl.split("?")[0];
  const { status } = input;
  const level: Level = status >= 500 ? "error" : status >= 400 ? "warn" : path === "/health" ? "debug" : "info";
  return {
    level,
    msg: "request" as const,
    fields: {
      method: input.method,
      path,
      status,
      durationMs: Math.round(input.durationMs),
      requestId: input.requestId,
      ...(typeof input.userId === "number" ? { userId: input.userId } : {}),
    },
  };
}
