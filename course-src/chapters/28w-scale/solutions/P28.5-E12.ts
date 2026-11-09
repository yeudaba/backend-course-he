// P28.5-E12: הכנסה של הרבה שורות — מעט round trips, עם unnest
import type { Pool } from "pg";

export interface PageView {
  id: string;
  userId: number;
  path: string;
  at: string;
}

export async function bulkInsertViews(pool: Pool, rows: PageView[], { batchSize = 5000 } = {}): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const b = rows.slice(i, i + batchSize);
    // ארבעה מערכים — ארבעה פרמטרים, לא 4 × 5000 (ל־PostgreSQL יש תקרה של 65,535 פרמטרים בשאילתה)
    const res = await pool.query(
      `INSERT INTO page_views (id, user_id, path, viewed_at)
       SELECT * FROM unnest($1::text[], $2::int[], $3::text[], $4::timestamptz[])
       ON CONFLICT (id) DO NOTHING`,
      [b.map((r) => r.id), b.map((r) => r.userId), b.map((r) => r.path), b.map((r) => r.at)],
    );
    inserted += res.rowCount ?? 0;
  }
  return inserted;
}
