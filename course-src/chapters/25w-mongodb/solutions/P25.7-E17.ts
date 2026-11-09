// P25.7-E17
import type { Db, MongoClient } from "mongodb";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export class OutOfStockError extends Error {}

// הזמנה = הורדת מלאי בכמה מוצרים + מסמך הזמנה. או הכול, או כלום — טרנזקציה
export async function placeOrder(client: MongoClient, db: Db, customerId: string, cart: { productId: string; qty: number }[]) {
  if (!cart.length) throw new RangeError("עגלה ריקה");
  const session = client.startSession();
  try {
    return await session.withTransaction(async () => {
      const items = [];
      for (const { productId, qty } of cart) {
        // כל פעולה בתוך הטרנזקציה — עם { session }. בלי זה היא רצה מחוץ לטרנזקציה ולא מתבטלת
        const p = await db.collection<Product>("products").findOneAndUpdate(
          { _id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { session, returnDocument: "after", projection: { name: 1, price: 1 } }
        );
        if (!p) throw new OutOfStockError(`אין מספיק ${productId}`); // זריקה ← withTransaction מבטל הכול
        items.push({ productId, name: p.name, price: p.price, qty }); // מחיר מהמסד, לא מהלקוח
      }
      const order = { customerId, status: "pending", createdAt: new Date(), items, total: items.reduce((s, i) => s + i.price * i.qty, 0) };
      const { insertedId } = await db.collection("orders").insertOne(order, { session });
      return { _id: insertedId, ...order };
    });
  } finally {
    await session.endSession();
  }
}
