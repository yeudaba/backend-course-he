// P25.7-E54: PATCH למוצר — רק שדות מותרים
import type { Db } from "mongodb";
import { z } from "zod";

const schema = z.strictObject({
  name: z.string().trim().min(1).optional(),
  price: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export async function patchProduct(db: Db, id: string, body: unknown) {
  const r = schema.safeParse(body);
  if (!r.success || Object.keys(r.data).length === 0) throw new Error("VALIDATION_ERROR");
  const doc = await db.collection<{ _id: string; name: string; price: number; tags: string[] }>("products").findOneAndUpdate(
    { _id: id },
    { $set: r.data },
    { returnDocument: "after", projection: { name: 1, price: 1, tags: 1 } },
  );
  return doc ? { id: doc._id, name: doc.name, price: doc.price, tags: doc.tags } : null;
}
