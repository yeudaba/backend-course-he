// P26.5-E17: transactional outbox — ההזמנה והאירוע נשמרים יחד; relay שולח אחר כך
import type { Pool } from "pg";

export interface OutboxRow {
  id: number;
  topic: string;
  key: string;
  payload: any;
}

export async function placeOrder(pool: Pool, order: { email: string; totalCents: number }): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("INSERT INTO orders (email, total_cents) VALUES ($1, $2) RETURNING id", [order.email, order.totalCents]);
    const id = rows[0].id as number;
    await client.query("INSERT INTO outbox (topic, key, payload) VALUES ('orders', $1, $2)", [
      String(id),
      { type: "order.placed", orderId: id, email: order.email, totalCents: order.totalCents },
    ]);
    await client.query("COMMIT");
    return id;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function relayOutbox(pool: Pool, publish: (row: OutboxRow) => Promise<void>, { batch = 100 } = {}): Promise<number> {
  const client = await pool.connect();
  const sent: number[] = [];
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT id, topic, key, payload FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED",
      [batch],
    );
    let failure: unknown = null;
    for (const r of rows) {
      try {
        await publish({ id: Number(r.id), topic: r.topic, key: r.key, payload: r.payload });
        sent.push(Number(r.id));
      } catch (err) {
        failure = err; // עוצרים: לשמור על הסדר. מה שנשלח — מסמנים
        break;
      }
    }
    if (sent.length) await client.query("UPDATE outbox SET published_at = now() WHERE id = ANY($1::bigint[])", [sent]);
    await client.query("COMMIT");
    if (failure) throw failure;
    return sent.length;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
