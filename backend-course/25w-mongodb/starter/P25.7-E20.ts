// P25.7-E20: חיפוש מוצרים לפי ה־query string (?q=&category=) — שלוש תקלות
import type { Db } from "mongodb";

export async function searchProducts(db: Db, query: Record<string, any>) {
  const filter: Record<string, any> = {};
  if (query.category) filter.category = query.category;
  if (query.q) filter.name = { $regex: query.q, $options: "i" };
  return db.collection("products").find(filter, { projection: { name: 1, price: 1 } }).sort({ name: 1 }).toArray();
}
