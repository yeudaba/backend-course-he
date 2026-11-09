// P25.7-E23
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

// ביטול הזמנה: מחזירים את הכמויות למלאי ומסמנים cancelled — באותה טרנזקציה
export async function cancelOrder(client: MongoClient, db: Db, orderId: string) {
  const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      // תקלה 1: התנאי על הסטטוס בתוך העדכון — כך שני ביטולים במקביל לא יחזירו מלאי פעמיים
      const order = await db.collection<Order>("orders").findOneAndUpdate(
        { _id: orderId, status: { $in: ["pending", "paid"] } },
        { $set: { status: "cancelled", cancelledAt: new Date() } },
        { session }
      );
      if (!order) return false;
      for (const it of order.items) {
        // תקלה 2: { session } — אחרת ההחזרה למלאי לא חלק מהטרנזקציה
        // תקלה 3: $inc ולא $set: מחזירים את הכמות, לא דורסים את המלאי
        await db.collection<Product>("products").updateOne({ _id: it.productId }, { $inc: { stock: it.qty } }, { session });
      }
      return true;
    });
  } finally {
    await session.endSession();
  }
}
