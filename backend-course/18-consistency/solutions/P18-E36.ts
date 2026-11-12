// P18-E36: תשלום משכורות — הכול או כלום
import type { Pool } from "pg";

export async function payMany(pool: Pool, fromId: number, payments: { toId: number; amount: number }[]): Promise<number[]> {
  if (payments.length === 0) return [];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ids: number[] = [];
    for (const { toId, amount } of payments) {
      await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
      const to = await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
      if (to.rowCount === 0) throw new Error(`חשבון לא קיים: ${toId}`);
      const { rows } = await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3) RETURNING id", [fromId, toId, amount]);
      ids.push(rows[0].id);
    }
    await client.query("COMMIT");
    return ids;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
