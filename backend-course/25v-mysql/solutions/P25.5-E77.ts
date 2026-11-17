// P25.5-E77: "סמן כנשלח" — שלוש תשובות שונות
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function markShipped(pool: Pool, orderId: number) {
  const [res] = await pool.execute<ResultSetHeader>(
    "UPDATE orders SET status = 'shipped' WHERE id = ? AND status IN ('paid', 'shipped')",
    [orderId],
  );
  if (res.changedRows === 1) return "shipped" as const;
  if (res.affectedRows === 1) return "already" as const;
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT 1 FROM orders WHERE id = ?", [orderId]);
  return rows.length ? ("invalid_status" as const) : ("not_found" as const);
}
