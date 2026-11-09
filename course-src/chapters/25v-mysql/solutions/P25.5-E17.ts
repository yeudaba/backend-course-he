// P25.5-E17
import type { Pool } from "mysql2/promise";

export class InProgress extends Error {}

// Idempotency ב־MySQL: INSERT IGNORE על מפתח ראשי — affectedRows 1 = "אני הראשון", 0 = כבר קיים.
// (ב־PostgreSQL: ON CONFLICT DO NOTHING RETURNING.) התוצאה נשמרת כ־JSON, והבקשה החוזרת מקבלת אותה
export async function once<T>(pool: Pool, key: string, fn: () => Promise<T>): Promise<{ result: T; replayed: boolean }> {
  const [ins] = await pool.execute<any>("INSERT IGNORE INTO idempotency (idem_key, status) VALUES (?, 'pending')", [key]);
  if (ins.affectedRows === 1) {
    try {
      const result = await fn();
      await pool.execute("UPDATE idempotency SET status = 'done', result = ? WHERE idem_key = ?", [JSON.stringify(result), key]);
      return { result, replayed: false };
    } catch (err) {
      await pool.execute("DELETE FROM idempotency WHERE idem_key = ?", [key]); // נכשל ← אפשר לנסות שוב עם אותו מפתח
      throw err;
    }
  }
  const [rows] = await pool.execute<any[]>("SELECT status, result FROM idempotency WHERE idem_key = ?", [key]);
  if (!rows[0] || rows[0].status !== "done") throw new InProgress(`בקשה ${key} עדיין בטיפול`);
  const stored = rows[0].result;
  return { result: (typeof stored === "string" ? JSON.parse(stored) : stored) as T, replayed: true };
}
