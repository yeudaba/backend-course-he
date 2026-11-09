// P25.7-E16
import type { Db } from "mongodb";

interface Review {
  by: string;
  rating: number;
}
interface Product {
  _id: string;
  reviews: Review[];
  ratingCount: number;
  ratingSum: number;
}

export async function addReview(db: Db, productId: string, { by, rating }: { by: string; rating: number }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new RangeError("rating: 1 עד 5");
  // פקודה אחת: התנאי "הלקוח עוד לא דירג", הוספת הדירוג, ועדכון הסיכום — הכול אטומי על המסמך.
  // כך הממוצע (ratingSum / ratingCount) תמיד תואם למערך, גם בשתי בקשות במקביל
  const r = await db.collection<Product>("products").updateOne(
    { _id: productId, "reviews.by": { $ne: by } },
    { $push: { reviews: { by, rating } }, $inc: { ratingCount: 1, ratingSum: rating } }
  );
  return r.modifiedCount === 1;
}

export async function averageRating(db: Db, productId: string) {
  const p = await db.collection<Product>("products").findOne({ _id: productId }, { projection: { ratingCount: 1, ratingSum: 1 } });
  if (!p) return null;
  return p.ratingCount === 0 ? 0 : Math.round((p.ratingSum / p.ratingCount) * 10) / 10;
}
