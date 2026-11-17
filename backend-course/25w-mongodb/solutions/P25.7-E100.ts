// P25.7-E100: עגלה שפגה לבד — TTL
import type { Db } from "mongodb";

const WEEK_MS = 7 * 86_400_000;

export async function ensureCartTtl(db: Db): Promise<void> {
  await db.collection("carts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function touchCart(db: Db, customerId: string, now: Date): Promise<Date> {
  const expiresAt = new Date(now.getTime() + WEEK_MS);
  await db.collection<{ _id: string }>("carts").updateOne(
    { _id: customerId },
    { $set: { updatedAt: now, expiresAt }, $setOnInsert: { items: [] } },
    { upsert: true },
  );
  return expiresAt;
}
