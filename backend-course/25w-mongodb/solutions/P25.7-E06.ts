// P25.7-E06
import type { Db } from "mongodb";

// בונים את ה־filter רק מהשדות שהגיעו: undefined לא נכנס, אחרת הוא היה מחפש "שדה שערכו null"
export async function findProducts(db: Db, { category, maxPrice, inStock, tag }: { category?: string; maxPrice?: number; inStock?: boolean; tag?: string } = {}) {
  const filter: Record<string, unknown> = {};
  if (category !== undefined) filter.category = category;
  if (maxPrice !== undefined) filter.price = { $lte: maxPrice };
  if (inStock) filter.stock = { $gt: 0 };
  if (tag !== undefined) filter.tags = tag; // על מערך: "המערך מכיל את הערך"
  return db
    .collection("products")
    .find(filter, { projection: { _id: 1, name: 1, price: 1 } })
    .sort({ price: 1, _id: 1 }) // שובר שוויון — סדר יציב
    .toArray();
}
