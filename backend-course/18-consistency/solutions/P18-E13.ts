// P18-E13
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function transferSafe(pool: Pool, fromId: number, toId: number, amount: number) {
  if (fromId === toId) throw new AppError("SAME_ACCOUNT");
  if (!(amount > 0)) throw new AppError("INVALID_AMOUNT");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // נעילה לפי סדר id — שתי העברות הפוכות לא יחכו זו לזו במעגל
    const { rows } = await client.query("SELECT id, balance FROM accounts WHERE id = ANY($1) ORDER BY id FOR UPDATE", [[fromId, toId]]);
    const from = rows.find((r) => r.id === fromId);
    const to = rows.find((r) => r.id === toId);
    if (!from || !to) throw new AppError("ACCOUNT_NOT_FOUND");
    if (Number(from.balance) < amount) throw new AppError("INSUFFICIENT_FUNDS");

    const a = await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING balance", [amount, fromId]);
    const b = await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING balance", [amount, toId]);
    const t = await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3) RETURNING id", [fromId, toId, amount]);
    await client.query("COMMIT");
    return { transferId: t.rows[0].id, fromBalance: Number(a.rows[0].balance), toBalance: Number(b.rows[0].balance) };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
