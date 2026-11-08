// P26.5-E23: outbox — שלוש תקלות
import type { Pool } from "pg";

export async function placeOrder(pool: Pool, order: { email: string; totalCents: number }): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT nextval('orders_id_seq') AS id");
    const id = Number(rows[0].id);
    await pool.query("INSERT INTO outbox (topic, key, payload) VALUES ('orders', $1, $2)", [
      String(id),
      { type: "order.placed", orderId: id, totalCents: order.totalCents },
    ]);
    await client.query("INSERT INTO orders (id, email, total_cents) VALUES ($1, $2, $3)", [id, order.email, order.totalCents]);
    await client.query("COMMIT");
    return id;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function relayOutbox(pool: Pool, publish: (row: any) => Promise<void>): Promise<number> {
  const { rows } = await pool.query("SELECT id, topic, key, payload FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT 50");
  for (const r of rows) {
    await pool.query("UPDATE outbox SET published_at = now() WHERE id = $1", [r.id]);
    await publish(r);
  }
  return rows.length;
}
