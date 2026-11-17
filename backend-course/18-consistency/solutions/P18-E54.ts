// P18-E54: מגבלה יומית להעברות
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function transferWithLimit(pool: Pool, fromId: number, toId: number, amount: number, dailyLimit: number): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const acc = await client.query("SELECT id FROM accounts WHERE id = $1 FOR UPDATE", [fromId]);
    if (acc.rowCount === 0) throw new AppError("ACCOUNT_NOT_FOUND");
    const { rows } = await client.query(
      "SELECT COALESCE(SUM(amount), 0) AS sent FROM transfers WHERE from_id = $1 AND created_at >= date_trunc('day', now())",
      [fromId],
    );
    if (Number(rows[0].sent) + amount > dailyLimit) throw new AppError("DAILY_LIMIT");
    await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    const t = await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3) RETURNING id", [fromId, toId, amount]);
    await client.query("COMMIT");
    return t.rows[0].id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
