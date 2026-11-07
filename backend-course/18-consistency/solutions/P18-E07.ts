// P18-E07
import type { Pool } from "pg";

export async function transfer(pool: Pool, fromId: number, toId: number, amount: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    const { rows } = await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3) RETURNING id", [fromId, toId, amount]);
    await client.query("COMMIT");
    return rows[0].id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
