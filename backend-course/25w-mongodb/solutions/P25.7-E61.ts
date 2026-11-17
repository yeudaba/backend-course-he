// P25.7-E61: לתקן תקצירי דירוג
import type { Db } from "mongodb";

type P = { _id: string; reviews?: { rating: number }[]; ratingCount?: number; ratingSum?: number };

export async function recomputeRatings(db: Db): Promise<string[]> {
  const products = db.collection<P>("products");
  const fixed: string[] = [];
  for (const p of await products.find({}, { projection: { reviews: 1, ratingCount: 1, ratingSum: 1 } }).toArray()) {
    const reviews = p.reviews ?? [];
    const count = reviews.length;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    if (p.ratingCount !== count || p.ratingSum !== sum) {
      await products.updateOne({ _id: p._id }, { $set: { ratingCount: count, ratingSum: sum } });
      fixed.push(p._id);
    }
  }
  return fixed.sort();
}
