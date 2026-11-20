// P28-E82: מאיפה לקרוא?
export type Policy = { kind: "strong" } | { kind: "stale-ok"; maxStaleMs: number; cacheable: boolean };

export function readSource(policy: Policy, ctx: { lastWriteAt: number | null; now: number; inTransaction: boolean }): "cache" | "replica" | "primary" {
  if (policy.kind !== "strong" || ctx.inTransaction) return "primary";
  if (policy.maxStaleMs < 0) throw new RangeError("maxStaleMs שלילי");
  if (ctx.lastWriteAt !== null && ctx.now - ctx.lastWriteAt < policy.maxStaleMs) return "primary";
  return policy.cacheable ? "cache" : "replica";
}
