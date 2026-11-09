// P25.5-E21: "הדוח היומי מראה סכומים מוזרים, 'סמן כנשלח' נכשל על הזמנות שכבר נשלחו, והיום מתחיל בשעה הלא נכונה" — שלוש תקלות
import type { Connection } from "mysql2/promise";

export async function dailyReport(conn: Connection, day: string | Date) {
  const [rows] = await conn.execute<any[]>(
    "SELECT total FROM orders WHERE status IN ('paid', 'shipped') AND created_at >= ? AND created_at < ? + INTERVAL 1 DAY",
    [day, day],
  );
  const total = rows.reduce((s, r) => s + r.total, 0);
  return { day: String(day).slice(0, 10), orders: rows.length, totalCents: Math.round(Number(total) * 100) };
}

export async function markShipped(conn: Connection, orderId: number): Promise<boolean> {
  const [res] = await conn.execute<any>("UPDATE orders SET status = 'shipped' WHERE id = ? AND status IN ('paid', 'shipped')", [orderId]);
  return res.changedRows === 1;
}

export const dayParam = (day: string) => new Date(day);
