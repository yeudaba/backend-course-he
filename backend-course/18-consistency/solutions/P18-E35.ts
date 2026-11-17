// P18-E35: פתיחת חשבון עם הפקדה ראשונה
import type { Pool } from "pg";

export async function openAccount(pool: Pool, owner: string, fromId: number, deposit: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("INSERT INTO accounts (owner, balance) VALUES ($1, 0) RETURNING id", [owner]);
    const id: number = rows[0].id;
    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [deposit, fromId]);
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [deposit, id]);
    await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)", [fromId, id, deposit]);
    await client.query("COMMIT");
    return id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
