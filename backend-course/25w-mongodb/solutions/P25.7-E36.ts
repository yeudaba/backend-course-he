// P25.7-E36: מוצר חדש — עם Zod לפני insert
import type { Db } from "mongodb";
import { z } from "zod";

const schema = z.strictObject({
  name: z.string().trim().min(1),
  category: z.enum(["beans", "gear", "merch"]),
  price: z.number().int().positive(),
  stock: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
});

export async function addProduct(db: Db, input: unknown) {
  const r = schema.safeParse(input);
  if (!r.success) throw new Error("VALIDATION_ERROR");
  const { insertedId } = await db.collection("products").insertOne({ ...r.data, createdAt: new Date() });
  return { id: insertedId.toHexString() };
}
