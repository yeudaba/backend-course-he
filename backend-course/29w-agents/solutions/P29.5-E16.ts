// P29.5-E16: guardrails — בדיקות בקוד, לפני כלי ואחרי תשובה
import type { Store } from "../files/store.ts";

const luhn = (digits: string) => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return sum % 10 === 0;
};
const israeliId = (id: string) => {
  const s = id.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const d = Number(s[i]) * ((i % 2) + 1);
    sum += d > 9 ? d - 9 : d;
  }
  return sum % 10 === 0;
};

export function redactPII(text: string): string {
  return text
    .replace(/\b(?:\d[ -]?){13,19}\b/g, (m) => (luhn(m.replace(/\D/g, "")) ? "[כרטיס]" : m))
    .replace(/(?<!\d)\d{9}(?!\d)/g, (m) => (israeliId(m) ? "[ת״ז]" : m))
    .replace(/(?<!\d)0(?:5\d|[2-489])-?\d{7}(?!\d)/g, "[טלפון]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[אימייל]");
}

export function checkRefund(input: { orderId: number; amountCents: number }, ctx: { store: Store; customerId: number; maxRefundCents: number }): { ok: true } | { ok: false; reason: string } {
  const o = ctx.store.orders.get(input.orderId);
  if (!o || o.customerId !== ctx.customerId) return { ok: false, reason: "ההזמנה לא נמצאה" };
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) return { ok: false, reason: "סכום לא תקין" };
  if (o.status !== "paid" && o.status !== "shipped") return { ok: false, reason: `אי אפשר להחזיר הזמנה בסטטוס ${o.status}` };
  const already = ctx.store.refunds.filter((r) => r.orderId === o.id).reduce((s, r) => s + r.amountCents, 0);
  if (already + input.amountCents > o.totalCents) return { ok: false, reason: "הסכום גדול ממה שנשאר להחזיר" };
  if (input.amountCents > ctx.maxRefundCents) return { ok: false, reason: "מעל הסכום שסוכן רשאי להחזיר — דרוש נציג" };
  return { ok: true };
}
