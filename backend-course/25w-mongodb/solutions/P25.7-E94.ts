// P25.7-E94: מחירון חדש — ב־bulkWrite אחד
import type { Db } from "mongodb";

export async function applyPriceList(db: Db, list: { productId: string; price: number }[]) {
  for (const { price } of list) if (!Number.isInteger(price) || price <= 0) throw new RangeError(`מחיר לא תקין: ${price}`);
  if (list.length === 0) return { matched: 0, modified: 0, missing: [] };
  const products = db.collection<{ _id: string; price: number }>("products");
  const ids = [...new Set(list.map((l) => l.productId))];
  const found = new Set((await products.find({ _id: { $in: ids } }, { projection: { _id: 1 } }).toArray()).map((p) => p._id));
  const r = await products.bulkWrite(list.map(({ productId, price }) => ({ updateOne: { filter: { _id: productId }, update: { $set: { price } } } })));
  return { matched: r.matchedCount, modified: r.modifiedCount, missing: ids.filter((id) => !found.has(id)).sort() };
}
