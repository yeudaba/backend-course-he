// P26.5-E15: consumer אידמפוטנטי — "טופל" נרשם באותה טרנזקציה עם הפעולה
import type { Pool } from "pg";

export interface PaymentEvent {
  eventId: string;
  orderId: number;
  amountCents: number;
}

export async function handlePaymentEvent(pool: Pool, e: PaymentEvent): Promise<"processed" | "duplicate"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const mark = await client.query(
      "INSERT INTO processed_events (consumer, event_id) VALUES ('payments', $1) ON CONFLICT DO NOTHING",
      [e.eventId],
    );
    if (mark.rowCount === 0) {
      await client.query("ROLLBACK");
      return "duplicate"; // כבר טופל (או מטופל ממש עכשיו בטרנזקציה אחרת — ה־INSERT חיכה לה)
    }
    await client.query("INSERT INTO payments (order_id, amount_cents, event_id) VALUES ($1, $2, $3)", [e.orderId, e.amountCents, e.eventId]);
    const upd = await client.query("UPDATE orders SET status = 'paid' WHERE id = $1", [e.orderId]);
    if (upd.rowCount !== 1) throw new Error(`הזמנה ${e.orderId} לא קיימת`);
    await client.query("COMMIT");
    return "processed";
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err; // נכשל ← גם הסימון בוטל, ואפשר לנסות שוב
  } finally {
    client.release();
  }
}
