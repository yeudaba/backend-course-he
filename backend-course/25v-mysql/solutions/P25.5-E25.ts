// P25.5-E25
import type pg from "pg";
import type { Pool } from "mysql2/promise";

// העברת טבלה מ־PostgreSQL ל־MySQL — משימה אמיתית כשמחליפים מסד או מאחדים מערכות.
// בקבוצות (keyset לפי id, לא OFFSET), עם המרת טיפוסים, ו־idempotent: הרצה שנייה לא מכפילה (ON DUPLICATE KEY UPDATE)
export async function copyCustomers(source: pg.Client | pg.Pool, target: Pool, { batchSize = 500 } = {}): Promise<{ copied: number; batches: number }> {
  let lastId = 0;
  let copied = 0;
  let batches = 0;
  for (;;) {
    const { rows } = await source.query(
      "SELECT id, name, email, is_vip, balance::text AS balance, created_at FROM customers WHERE id > $1 ORDER BY id LIMIT $2",
      [lastId, batchSize],
    );
    if (rows.length === 0) break;
    const values = rows.map((r: any) => [
      r.id,
      r.name,
      r.email,
      r.is_vip ? 1 : 0, // boolean ← TINYINT(1)
      r.balance, // numeric כמחרוזת ← DECIMAL — בלי לעבור דרך float
      // timestamptz ← DATETIME(3) ב־UTC (MySQL DATETIME לא שומר אזור זמן — מחליטים ומתעדים: UTC)
      (r.created_at as Date).toISOString().slice(0, 23).replace("T", " "),
    ]);
    await target.query(
      "INSERT INTO customers (id, name, email, is_vip, balance, created_at) VALUES ? AS new " +
        "ON DUPLICATE KEY UPDATE name = new.name, email = new.email, is_vip = new.is_vip, balance = new.balance, created_at = new.created_at",
      [values],
    );
    copied += rows.length;
    batches++;
    lastId = rows[rows.length - 1].id;
  }
  return { copied, batches };
}
