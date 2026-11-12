// P26.5-E89: לפענח הודעה לפי event-type, עם zod
import { z } from "zod";

const id = z.number().int().positive();
const schemas: Record<string, z.ZodType<{ orderId: number }>> = {
  "order.placed": z.object({ orderId: id, email: z.string().includes("@"), totalCents: id }),
  "order.paid": z.object({ orderId: id, amountCents: id }),
  "order.shipped": z.object({ orderId: id, carrier: z.string().min(1) }),
};

type Result = { ok: true; type: string; event: unknown } | { ok: false; reason: string };

export function decodeMessage(m: { key: string | null; value: string; headers: Record<string, string> }): Result {
  const type = m.headers["event-type"];
  if (!type) return { ok: false, reason: "missing-type" };
  const schema = schemas[type];
  if (!schema) return { ok: false, reason: "unknown-type" };
  let data: unknown;
  try {
    data = JSON.parse(m.value);
  } catch {
    return { ok: false, reason: "bad-json" };
  }
  const r = schema.safeParse(data);
  if (!r.success) return { ok: false, reason: "invalid" };
  if (m.key !== String(r.data.orderId)) return { ok: false, reason: "wrong-key" };
  return { ok: true, type, event: data };
}
