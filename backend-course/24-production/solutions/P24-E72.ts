// P24-E72: webhook פעם אחת — במסד
import type { Pool } from "pg";

export async function handlePaymentEvent(pool: Pool, event: { id: string; orderId: number; amountCents: number }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const claimed = await client.query(
      "INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING event_id",
      [event.id],
    );
    if (claimed.rowCount === 0) {
      await client.query("ROLLBACK");
      return "duplicate" as const;
    }
    const updated = await client.query(
      "UPDATE orders SET status = 'paid', paid_cents = paid_cents + $2 WHERE id = $1",
      [event.orderId, event.amountCents],
    );
    if (updated.rowCount === 0) throw new Error("ORDER_NOT_FOUND");
    await client.query("COMMIT");
    return "processed" as const;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
