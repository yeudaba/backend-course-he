// P25.7-E102: ביקורת במוצר — ratingCount לא זז, ביקורות במקביל מקלקלות את הסכום, ודירוג 7 עובר.
// rating 1–5 (אחרת RangeError) · מוצר לא קיים / לקוח שכבר כתב ← false · אחרת push + ratingCount+1 + ratingSum+rating ← true
//
// בדיקה:  npm run check P25.7-E102
import type { Db } from "mongodb";

export async function addReview(db: Db, productId: string, review: { by: string; rating: number }): Promise<boolean> {
  const products = db.collection<any>("products");
  const p = await products.findOne({ _id: productId });
  if (!p) return false;
  if (p.reviews.some((r: { by: string }) => r.by === review.by)) return false;
  await products.updateOne({ _id: productId }, { $push: { reviews: { by: review.by, rating: review.rating } }, $set: { ratingSum: p.ratingSum + review.rating } });
  return true;
}
