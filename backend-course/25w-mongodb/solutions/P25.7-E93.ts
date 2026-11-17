// P25.7-E93: העברת מלאי בין מחסנים — בטרנזקציה
import type { Db, MongoClient } from "mongodb";

export async function moveStock(client: MongoClient, db: Db, { from, to, productId, qty }: { from: string; to: string; productId: string; qty: number }) {
  if (!Number.isInteger(qty) || qty <= 0) throw new RangeError(`כמות לא תקינה: ${qty}`);
  const warehouses = db.collection<{ _id: string }>("warehouses");
  const field = `stock.${productId}`;
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const out = await warehouses.updateOne({ _id: from, [field]: { $gte: qty } }, { $inc: { [field]: -qty } }, { session });
      if (out.modifiedCount === 0) throw new Error("INSUFFICIENT_STOCK");
      const inn = await warehouses.updateOne({ _id: to }, { $inc: { [field]: qty } }, { session });
      if (inn.matchedCount === 0) throw new Error("NO_SUCH_WAREHOUSE"); // abort — גם ההורדה מתבטלת
    });
  } finally {
    await session.endSession();
  }
}
