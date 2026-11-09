// P25.7-E09
import type { Db } from "mongodb";

// collection עם טיפוס: TypeScript יודע ש־tags הוא מערך של מחרוזות, ובודק את $addToSet ו־$pull
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  tags: string[];
}

const norm = (t: string) => t.trim().toLowerCase();

// $addToSet — מוסיף רק אם לא קיים. $push היה מוסיף כפילות
export async function addTag(db: Db, productId: string, tag: string) {
  const r = await db.collection<Product>("products").updateOne({ _id: productId }, { $addToSet: { tags: norm(tag) } });
  return r.matchedCount === 1;
}

export async function removeTag(db: Db, productId: string, tag: string) {
  const r = await db.collection<Product>("products").updateOne({ _id: productId }, { $pull: { tags: norm(tag) } });
  return r.matchedCount === 1;
}
