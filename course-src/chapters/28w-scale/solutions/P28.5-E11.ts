// P28.5-E11: אגרגציה על קובץ ענק — שורה אחרי שורה, בזיכרון קבוע
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

export interface DayTotals {
  orders: number;
  revenueCents: number;
}

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" });
export const israelDay = (iso: string) => dayFmt.format(new Date(iso)); // "2026-10-31"

export async function dailyRevenue(input: Readable): Promise<Record<string, DayTotals>> {
  const totals: Record<string, DayTotals> = {};
  const lines = createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line.trim()) continue;
    const o = JSON.parse(line) as { createdAt: string; quantity: number; priceCents: number; status?: string };
    if (o.status === "cancelled") continue;
    const day = israelDay(o.createdAt);
    const t = (totals[day] ??= { orders: 0, revenueCents: 0 });
    t.orders++;
    t.revenueCents += o.quantity * o.priceCents;
  }
  return totals;
}
