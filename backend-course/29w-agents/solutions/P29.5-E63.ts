// P29.5-E63: לקבל החלטות מהטופס
import { z } from "zod";

const Body = z.object({ decisions: z.record(z.string(), z.enum(["approve", "deny"])) });

export function parseDecisions(pendingIds: string[], body: unknown, who: { userId: number; ownerId: number }) {
  if (who.userId !== who.ownerId) throw new Error("forbidden");
  const parsed = Body.safeParse(body);
  if (!parsed.success) throw new Error("invalid decisions body");
  const d = parsed.data.decisions;
  const pending = new Set(pendingIds);
  const unknown = Object.keys(d).filter((id) => !pending.has(id));
  if (unknown.length) throw new Error(`unknown: ${unknown.join(", ")}`);
  const missing = pendingIds.filter((id) => !Object.hasOwn(d, id));
  if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  const out: Record<string, "approve" | "deny"> = {};
  for (const id of pendingIds) out[id] = d[id];
  return out;
}
