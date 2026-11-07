// P18-E20: מתוקן — חיבור אחד, ROLLBACK בשגיאה, release תמיד
import type { Pool } from "pg";

export async function transfer(pool: Pool, fromId: number, toId: number, amount: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
