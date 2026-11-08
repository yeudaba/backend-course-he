import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";

export const PAYMENT_GATEWAY = "PAYMENT_GATEWAY";

export type ChargeResult = { ok: true; reference: string } | { ok: false; reason: "declined" | "insufficient_funds"; reference: string };

// ממשק: מחר אפשר להחליף בספק אמיתי (Stripe, Tranzila) בלי לגעת ב־OrdersService
export interface PaymentGateway {
  charge(amountCents: number, cardNumber: string): Promise<ChargeResult>;
  refund(reference: string, amountCents: number): Promise<{ reference: string }>;
}

// בדיקת Luhn — הספרה האחרונה של כרטיס היא checksum
export function isValidCardNumber(card: string): boolean {
  if (!/^\d{12,19}$/.test(card)) return false;
  let sum = 0;
  for (let i = 0; i < card.length; i++) {
    let d = Number(card[card.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// תשלום מדומה, עם מספרי הכרטיסים "לבדיקות" המקובלים בתעשייה (כמו של Stripe):
// 4000000000000002 — נדחה; 4000000000009995 — אין כיסוי; כל כרטיס תקין אחר — מצליח
@Injectable()
export class FakePaymentGateway implements PaymentGateway {
  async charge(amountCents: number, cardNumber: string): Promise<ChargeResult> {
    const reference = `pay_${randomUUID()}`;
    if (cardNumber === "4000000000000002") return { ok: false, reason: "declined", reference };
    if (cardNumber === "4000000000009995") return { ok: false, reason: "insufficient_funds", reference };
    return { ok: true, reference };
  }

  async refund(reference: string, amountCents: number) {
    return { reference: `re_${randomUUID()}` };
  }
}
