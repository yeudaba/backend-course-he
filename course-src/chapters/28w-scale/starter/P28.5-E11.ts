// P28.5-E11: אגרגציה על קובץ ענק — שורה אחרי שורה, בזיכרון קבוע
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";

export interface DayTotals {
  orders: number;
  revenueCents: number;
}

export async function dailyRevenue(input: Readable): Promise<Record<string, DayTotals>> {
  throw new Error("עוד לא כתבת את הפתרון");
}
