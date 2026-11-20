// P25.7-E13
import type { Db } from "mongodb";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  tags: string[];
}

// התנאי (stock >= qty) והעדכון — באותה פקודה. השרת מבצע אותם אטומית על המסמך,
// כך ששתי בקשות במקביל לא יכולות שתיהן "לראות 1 במלאי" ולהוריד
export async function reserveStock(db: Db, productId: string, qty: number) {
  if (!Number.isInteger(qty) || qty <= 0) throw new RangeError("qty חייב להיות מספר שלם חיובי");
  const c = db.collection<Product>("products");
  const d = await c.findOne({ _id: productId });
  if (!d || d.stock < qty) return false;
  await c.updateOne({ _id: productId }, { $inc: { stock: -qty } });
  return true;
}
