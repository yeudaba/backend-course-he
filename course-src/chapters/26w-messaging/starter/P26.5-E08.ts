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
  throw new Error("עוד לא כתבת את הפתרון");
}

export interface OrderPlaced {
  orderId: number;
  email: string;
  total: { amountCents: number; currency: string };
}

export function parseOrderPlaced(raw: string): EventEnvelope<OrderPlaced> {
  throw new Error("עוד לא כתבת את הפתרון");
}
