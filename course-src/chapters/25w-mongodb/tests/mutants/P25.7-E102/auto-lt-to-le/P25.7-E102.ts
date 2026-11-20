// P25.7-E102: ביקורת במוצר, עם תקציר — מתוקן
import type { Db } from "mongodb";

export async function addReview(db: Db, productId: string, review: { by: string; rating: number }): Promise<boolean> {
  if (!Number.isInteger(review.rating) || review.rating <= 1 || review.rating > 5) throw new RangeError("rating חייב להיות 1–5");
  const res = await db.collection<{ _id: string }>("products").updateOne(
    { _id: productId, "reviews.by": { $ne: review.by } },
    { $push: { reviews: { by: review.by, rating: review.rating } } as never, $inc: { ratingCount: 1, ratingSum: review.rating } },
  );
  return res.modifiedCount === 1;
}
