// P25.7-E34: כרטיס מוצר
import type { Db } from "mongodb";

export async function productCard(db: Db, id: string) {
  const doc = await db.collection<{ _id: string; name: string; price: number; specs?: { roast?: string } }>("products")
    .findOne({ _id: id }, { projection: { name: 1, price: 1, "specs.roast": 1 } });
  if (!doc) return null;
  return { id: doc._id, name: doc.name, price: doc.price, roast: doc.specs?.roast ?? null };
}
