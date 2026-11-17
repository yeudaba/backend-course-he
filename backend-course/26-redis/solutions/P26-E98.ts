// P26-E98: מייל פעם אחת — UNIQUE ו־23505
import type pg from "pg";

type Email = { kind: string; orderId: number; to: string; subject: string; body: string };

export async function recordEmailOnce(pool: pg.Pool, e: Email): Promise<"sent" | "duplicate"> {
  try {
    await pool.query('INSERT INTO email_outbox (kind, order_id, "to", subject, body) VALUES ($1, $2, $3, $4, $5)', [e.kind, e.orderId, e.to, e.subject, e.body]);
    return "sent";
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return "duplicate";
    throw err;
  }
}
