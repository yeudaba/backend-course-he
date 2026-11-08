// P26.5-E08: מעטפת לאירועים — id, סוג, גרסה, זמן — ואימות בצד שמקבל
import { randomUUID } from "node:crypto";
import { z } from "zod";

export interface EventEnvelope<T = unknown> {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  source: string;
  data: T;
}

export function makeEvent<T>(type: string, version: number, data: T, { id = randomUUID(), now = new Date(), source = "coffee-api" } = {}): EventEnvelope<T> {
  return { id, type, version, occurredAt: now.toISOString(), source, data };
}

const envelope = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  version: z.number().int().positive(),
  occurredAt: z.iso.datetime(),
  source: z.string().min(1),
  data: z.unknown(),
});

const placedV1 = z.object({ orderId: z.number().int().positive(), email: z.email(), totalCents: z.number().int().positive() });
const placedV2 = z.object({
  orderId: z.number().int().positive(),
  email: z.email(),
  total: z.object({ amountCents: z.number().int().positive(), currency: z.string().length(3) }),
});
export type OrderPlaced = z.infer<typeof placedV2>;

// מקבל כל גרסה שאנחנו מכירים, ומחזיר תמיד את הצורה העדכנית (v2)
export function parseOrderPlaced(raw: string): EventEnvelope<OrderPlaced> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("לא JSON");
  }
  const env = envelope.parse(json);
  if (env.type !== "order.placed") throw new Error(`סוג לא צפוי: ${env.type}`);
  if (env.version === 1) {
    const d = placedV1.parse(env.data);
    return { ...env, version: 2, data: { orderId: d.orderId, email: d.email, total: { amountCents: d.totalCents, currency: "ILS" } } };
  }
  if (env.version === 2) return { ...env, data: placedV2.parse(env.data) };
  throw new Error(`גרסה לא מוכרת: ${env.version}`);
}
