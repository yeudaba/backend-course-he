// P26.5-E15: consumer אידמפוטנטי — "טופל" נרשם באותה טרנזקציה עם הפעולה
import type { Pool } from "pg";

export interface PaymentEvent {
  eventId: string;
  orderId: number;
  amountCents: number;
}

export async function handlePaymentEvent(pool: Pool, e: PaymentEvent): Promise<"processed" | "duplicate"> {
  throw new Error("עוד לא כתבת את הפתרון");
}
