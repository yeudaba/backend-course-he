// P25.7-E10: עמוד של מוצרים
import type { Db } from "mongodb";

export async function productsPage(db: Db, { page = 1, pageSize = 3, category }: { page?: number; pageSize?: number; category?: string } = {}) {
  return { items: [], total: 0, totalPages: 0 }; // כתוב כאן
}
