// P25.7-E48: תגית sold-out לפי המלאי
import type { Db } from "mongodb";

export async function syncSoldOutTags(db: Db) {
  const products = db.collection("products");
  const a = await products.updateMany({ stock: 0 }, { $addToSet: { tags: "sold-out" } });
  const b = await products.updateMany({ stock: { $gt: 0 } }, { $pull: { tags: "sold-out" } });
  return { tagged: a.modifiedCount, untagged: b.modifiedCount };
}
