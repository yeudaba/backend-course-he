// P25.5-E61: העברה בין ארנקים — בלי deadlock
import type { Pool, RowDataPacket } from "mysql2/promise";

export async function transfer(pool: Pool, fromId: number, toId: number, amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new RangeError(`סכום לא תקין: ${amount}`);
  if (fromId === toId) throw new Error("SAME_WALLET");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // תמיד מהקטן לגדול — כך שתי העברות הפוכות לא נועלות "אחת מכל צד"
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT customer_id, balance FROM wallets WHERE customer_id IN (?, ?) ORDER BY customer_id FOR UPDATE",
      [fromId, toId],
    );
    if (rows.length !== 2) throw new Error("WALLET_NOT_FOUND");
    const balance = new Map(rows.map((r) => [Number(r.customer_id), Number(r.balance)]));
    const from = balance.get(fromId)! - amount;
    const to = balance.get(toId)! + amount;
    if (from < 0) throw new Error("INSUFFICIENT_FUNDS");
    await conn.query("UPDATE wallets SET balance = ? WHERE customer_id = ?", [from, fromId]);
    await conn.query("UPDATE wallets SET balance = ? WHERE customer_id = ?", [to, toId]);
    await conn.commit();
    return { from, to };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
