// P25.7-E20
import type { Db } from "mongodb";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// חיפוש מוצרים לפי ה־query string: ?q=&category=
export async function searchProducts(db: Db, query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  // תקלה 1: ב־Express, ?category[$ne]=x הופך לאובייקט { $ne: "x" } — NoSQL injection. רק מחרוזות
  for (const k of ["q", "category"]) {
    if (query[k] !== undefined && typeof query[k] !== "string") throw new RangeError(`${k} חייב להיות מחרוזת`);
  }
  if (query.category) filter.category = query.category;
  if (typeof query.q === "string" && query.q.trim()) {
    // תקלה 2: הטקסט של המשתמש הוא טקסט, לא regex: "(" שובר, ו־".*" מחזיר הכול
    filter.name = { $regex: escapeRegex(query.q.trim()), $options: "i" };
  }
  // תקלה 3: בלי limit — "חיפוש ריק" מחזיר את כל הקטלוג
  return db.collection("products").find(filter, { projection: { name: 1, price: 1 } }).sort({ name: 1 }).limit(20).toArray();
}
