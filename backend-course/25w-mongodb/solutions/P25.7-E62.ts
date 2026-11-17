// P25.7-E62: הוצאת הביקורות ל־collection משלהן
import type { Db } from "mongodb";

type P = { _id: string; reviews?: { by: string; rating: number }[] };

export async function extractReviews(db: Db) {
  const reviews = db.collection("reviews");
  await reviews.createIndex({ productId: 1, by: 1 }, { unique: true });
  const products = db.collection<P>("products");
  let moved = 0;
  for (const p of await products.find({ reviews: { $exists: true } }, { projection: { reviews: 1 } }).toArray()) {
    for (const r of p.reviews ?? []) {
      const res = await reviews.updateOne({ productId: p._id, by: r.by }, { $set: { rating: r.rating } }, { upsert: true });
      moved += res.upsertedCount;
    }
    await products.updateOne({ _id: p._id }, { $unset: { reviews: "" } }); // רק אחרי שכל הביקורות נשמרו
  }
  return { moved };
}
