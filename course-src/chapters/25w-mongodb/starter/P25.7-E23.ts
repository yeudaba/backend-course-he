// P25.7-E23: ביטול הזמנה — מחזירים למלאי ומסמנים cancelled. שלוש תקלות
import type { Db, MongoClient } from "mongodb";

interface Order {
  _id: string;
  status: string;
  items: { productId: string; qty: number }[];
}
interface Product {
  _id: string;
  stock: number;
}

export async function cancelOrder(client: MongoClient, db: Db, orderId: string) {
  const order = await db.collection<Order>("orders").findOne({ _id: orderId });
  if (!order || !["pending", "paid"].includes(order.status)) return false;
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection<Order>("orders").updateOne({ _id: orderId }, { $set: { status: "cancelled", cancelledAt: new Date() } }, { session });
      for (const it of order.items) {
        await db.collection<Product>("products").updateOne({ _id: it.productId }, { $set: { stock: it.qty } });
      }
    });
    return true;
  } finally {
    await session.endSession();
  }
}
