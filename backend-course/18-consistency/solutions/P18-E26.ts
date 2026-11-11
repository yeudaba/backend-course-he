// P18-E26: withTransaction — עוזר שכותבים פעם אחת
import type { Pool, PoolClient } from "pg";

export async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function transferAll(pool: Pool, fromId: number, toId: number): Promise<number> {
  return withTransaction(pool, async (client) => {
    const { rows } = await client.query("SELECT balance FROM accounts WHERE id = $1 FOR UPDATE", [fromId]);
    if (rows.length === 0) throw new Error(`חשבון לא קיים: ${fromId}`);
    const amount = Number(rows[0].balance);
    if (amount === 0) throw new Error("אין מה להעביר");
    await client.query("UPDATE accounts SET balance = 0 WHERE id = $1", [fromId]);
    const to = await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    if (to.rowCount === 0) throw new Error(`חשבון לא קיים: ${toId}`);
    await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)", [fromId, toId, amount]);
    return amount;
  });
}
