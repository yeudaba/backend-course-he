// P24-E16
import type pg from "pg";

export interface Payment {
  id: number;
  userId: number;
  amountCents: number;
}

export async function createPayment(pool: pg.Pool, userId: number, key: string, amountCents: number): Promise<{ replayed: boolean; payment: Payment }> {
  const fingerprint = JSON.stringify({ amountCents });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // שתי טרנזקציות עם אותו (user_id, key): השנייה *מחכה* כאן עד שהראשונה מסתיימת (נעילה על ה־PRIMARY KEY),
    // ואז — אם הראשונה עשתה COMMIT — DO NOTHING ולא מחזירה שורה
    const claimed = await client.query(
      "INSERT INTO idempotency_keys (user_id, key, fingerprint) VALUES ($1, $2, $3) ON CONFLICT (user_id, key) DO NOTHING RETURNING key",
      [userId, key, fingerprint],
    );
    if (claimed.rowCount === 1) {
      const { rows } = await client.query("INSERT INTO payments (user_id, amount_cents) VALUES ($1, $2) RETURNING id", [userId, amountCents]);
      await client.query("UPDATE idempotency_keys SET payment_id = $1 WHERE user_id = $2 AND key = $3", [rows[0].id, userId, key]);
      await client.query("COMMIT");
      return { replayed: false, payment: { id: rows[0].id, userId, amountCents } };
    }
    // המפתח כבר קיים (ו־committed — אחרת היינו עדיין מחכים): מחזירים את מה שנוצר אז
    const { rows } = await client.query(
      `SELECT k.fingerprint, p.id, p.amount_cents FROM idempotency_keys k JOIN payments p ON p.id = k.payment_id
       WHERE k.user_id = $1 AND k.key = $2`,
      [userId, key],
    );
    await client.query("COMMIT");
    if (rows[0].fingerprint !== fingerprint) throw new Error("IDEMPOTENCY_KEY_REUSED");
    return { replayed: true, payment: { id: rows[0].id, userId, amountCents: rows[0].amount_cents } };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
