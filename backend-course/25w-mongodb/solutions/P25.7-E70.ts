// P25.7-E70: ביקורת חדשה — Zod, 121 ו־11000
import { MongoServerError, type Db } from "mongodb";
import { z } from "zod";

const schema = z.strictObject({
  productId: z.string().min(1),
  by: z.string().min(1),
  rating: z.number(),
  text: z.string().max(500).optional(),
});

export async function createReview(db: Db, input: unknown) {
  const r = schema.safeParse(input);
  if (!r.success) throw new Error("VALIDATION_ERROR");
  try {
    const { insertedId } = await db.collection("reviews").insertOne({ ...r.data, createdAt: new Date() });
    return { id: insertedId.toHexString() };
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 121) throw new Error("SCHEMA_VIOLATION");
    if (err instanceof MongoServerError && err.code === 11000) throw new Error("ALREADY_REVIEWED");
    throw err;
  }
}
