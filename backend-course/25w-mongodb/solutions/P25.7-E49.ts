// P25.7-E49: מחיר חדש — רק אם לא השתנה בינתיים
import type { Db } from "mongodb";

export async function updatePrice(db: Db, id: string, expectedPrice: number, newPrice: number) {
  if (!Number.isInteger(newPrice) || newPrice <= 0) throw new RangeError(`מחיר לא תקין: ${newPrice}`);
  const products = db.collection<{ _id: string; price: number }>("products");
  const r = await products.updateOne({ _id: id, price: expectedPrice }, { $set: { price: newPrice } });
  if (r.matchedCount === 1) return "updated" as const;
  return (await products.countDocuments({ _id: id }, { limit: 1 })) ? ("conflict" as const) : ("not_found" as const);
}
