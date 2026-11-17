// P25.5-E63: דוח עקבי — תמונה אחת
import type { Pool, RowDataPacket } from "mysql2/promise";

export async function salesReport(pool: Pool, between?: () => Promise<void>) {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION READ ONLY, WITH CONSISTENT SNAPSHOT");
    const [[sum]] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status IN ('paid', 'shipped')",
    );
    await between?.();
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM orders WHERE status IN ('paid', 'shipped') ORDER BY id");
    await conn.query("COMMIT");
    return { orders: Number(sum.orders), revenue: Number(sum.revenue), ids: rows.map((r) => Number(r.id)) };
  } catch (err) {
    await conn.query("ROLLBACK");
    throw err;
  } finally {
    conn.release();
  }
}
