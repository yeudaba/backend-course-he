// P25.7-E11
import type { Db } from "mongodb";

export async function customerOrders(db: Db, customerId: string, { status }: { status?: string[] } = {}) {
  const filter: Record<string, unknown> = { customerId };
  if (status?.length) filter.status = { $in: status };
  return db
    .collection("orders")
    // בלי items — ברשימה מציגים סיכום; הפרטים בדף ההזמנה
    .find(filter, { projection: { items: 0, customerId: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}
