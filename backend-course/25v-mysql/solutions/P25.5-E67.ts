// P25.5-E67: ספירת צפיות — 50 במקביל
import type { Pool, RowDataPacket } from "mysql2/promise";

export async function recordView(pool: Pool, productId: number, day: string): Promise<void> {
  await pool.execute(
    "INSERT INTO product_views (product_id, day, views) VALUES (?, ?, 1) AS n ON DUPLICATE KEY UPDATE views = product_views.views + 1",
    [productId, day],
  );
}

export async function topProducts(pool: Pool, day: string, limit: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT product_id, views FROM product_views WHERE day = ? ORDER BY views DESC, product_id LIMIT ?",
    [day, limit],
  );
  return rows.map((r) => ({ productId: Number(r.product_id), views: Number(r.views) }));
}
