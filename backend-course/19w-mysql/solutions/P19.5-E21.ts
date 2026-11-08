// P19.5-E21
import type { Connection } from "mysql2/promise";

export async function dailyReport(conn: Connection, day: string) {
  const [rows] = await conn.execute<any[]>(
    "SELECT total FROM orders WHERE status IN ('paid', 'shipped') AND created_at >= ? AND created_at < ? + INTERVAL 1 DAY",
    [day, day],
  );
  // תקלה 1: היה rows.reduce((s, r) => s + r.total, 0) ← total הוא מחרוזת ("89.90"), והתוצאה "089.90119.00"
  const cents = rows.reduce((s, r) => s + Math.round(Number(r.total) * 100), 0);
  return { day, orders: rows.length, totalCents: cents };
}

export async function markShipped(conn: Connection, orderId: number): Promise<boolean> {
  const [res] = await conn.execute<any>("UPDATE orders SET status = 'shipped' WHERE id = ? AND status IN ('paid', 'shipped')", [orderId]);
  // תקלה 2: היה changedRows === 1 ← הזמנה שכבר shipped (ערך זהה) החזירה false, כאילו לא קיימת או לא שולמה.
  // affectedRows — כמה שורות התאימו ל־WHERE (ב־mysql2 ברירת המחדל: CLIENT_FOUND_ROWS)
  return res.affectedRows === 1;
}

// תקלה 3: היה new Date(day) ← "2026-03-01" כ־Date ב־UTC, ו־mysql2 שולח אותו לפי אזור הזמן של התהליך —
// בשרת בישראל השאילתה התחילה ב־"2026-03-01 02:00". מחרוזת 'YYYY-MM-DD' עוברת כמו שהיא
export const dayParam = (day: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("תאריך בפורמט YYYY-MM-DD");
  return day;
};
