// P28.5-E12: הכנסה של הרבה שורות — מעט round trips, עם unnest
import type { Pool } from "pg";

export interface PageView {
  id: string;
  userId: number;
  path: string;
  at: string;
}

export async function bulkInsertViews(pool: Pool, rows: PageView[], { batchSize = 5000 } = {}): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
