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
  throw new Error("עוד לא כתבת את הפתרון");
}

export function checkRefund(input: { orderId: number; amountCents: number }, ctx: { store: Store; customerId: number; maxRefundCents: number }): { ok: true } | { ok: false; reason: string } {
  throw new Error("עוד לא כתבת את הפתרון");
}
