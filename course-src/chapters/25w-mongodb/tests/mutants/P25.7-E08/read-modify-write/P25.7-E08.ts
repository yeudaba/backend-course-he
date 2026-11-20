// P25.7-E08
import type { Db } from "mongodb";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  tags: string[];
}

export async function restock(db: Db, productId: string, qty: number) {
  if (!Number.isInteger(qty) || qty <= 0) throw new RangeError("qty חייב להיות מספר שלם חיובי");
  // $inc אטומי בשרת — לא "קרא, חבר, כתוב" (שני מחסנאים במקביל היו דורסים זה את זה)
  const c = db.collection<Product>("products");
  const doc = await c.findOne({ _id: productId });
  if (!doc) return null;
  await c.updateOne({ _id: productId }, { $set: { stock: doc.stock + qty } });
  return doc.stock + qty;
}
