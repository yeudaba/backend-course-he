// P26.5-E23: outbox — אחרי התיקון
import type { Pool } from "pg";

export async function placeOrder(pool: Pool, order: { email: string; totalCents: number }): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("INSERT INTO orders (email, total_cents) VALUES ($1, $2) RETURNING id", [order.email, order.totalCents]);
    // תיקון 1: client, לא pool — אותה טרנזקציה. pool.query רץ על חיבור אחר, ונשמר גם כשההזמנה נכשלת
    await client.query("INSERT INTO outbox (topic, key, payload) VALUES ('orders', $1, $2)", [
      String(rows[0].id),
      { type: "order.placed", orderId: rows[0].id, totalCents: order.totalCents },
    ]);
    await client.query("COMMIT");
    return rows[0].id;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function relayOutbox(pool: Pool, publish: (row: any) => Promise<void>): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      // תיקון 3: FOR UPDATE SKIP LOCKED — שני relays במקביל לא לוקחים את אותן שורות
      "SELECT id, topic, key, payload FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT 50 FOR UPDATE SKIP LOCKED",
    );
    for (const r of rows) {
      await publish(r);
      // תיקון 2: מסמנים אחרי ש־publish הצליח, לא לפני
      await client.query("UPDATE outbox SET published_at = now() WHERE id = $1", [r.id]);
    }
    await client.query("COMMIT");
    return rows.length;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
