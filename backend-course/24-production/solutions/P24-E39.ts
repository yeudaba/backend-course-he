// P24-E39: Error ללוג, בשורה אחת
export function serializeError(e: unknown): Record<string, unknown> {
  if (e instanceof Error) {
    const x = e as Error & { code?: unknown };
    const out: Record<string, unknown> = { name: x.name, message: x.message, stack: x.stack };
    if (typeof x.code === "string" || typeof x.code === "number") out.code = x.code;
    if (x.cause !== undefined) out.cause = serializeError(x.cause);
    return out;
  }
  const message = typeof e === "string" ? e : (JSON.stringify(e) ?? String(e));
  return { name: "NonError", message };
}

export function errorLine(msg: string, e: unknown, now: Date): string {
  return JSON.stringify({ time: now.toISOString(), level: "error", msg, err: serializeError(e) });
}

const err = new Error("save failed", { cause: Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }) });
const line = errorLine("db failed", err, new Date("2026-11-07T15:30:00Z"));
console.log(line.includes("\n"), JSON.parse(line).err.cause.code);
console.log(serializeError("oops"), serializeError(undefined));
