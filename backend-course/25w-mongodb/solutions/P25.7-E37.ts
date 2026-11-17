// P25.7-E37: ההזמנות האחרונות של לקוח
import type { Db } from "mongodb";

type Order = { _id: string; customerId: string; status: string; total: number; createdAt: Date };

export async function lastOrders(db: Db, customerId: string, limit: number) {
  const docs = await db.collection<Order>("orders")
    .find({ customerId }, { projection: { status: 1, total: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((o) => ({ id: o._id, status: o.status, total: o.total, createdAt: o.createdAt.toISOString() }));
}
