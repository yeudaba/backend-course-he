// P25.7-E84: לקוחות חוזרים — עם השם
import type { Db } from "mongodb";

export async function repeatCustomers(db: Db, minOrders: number) {
  const rows = await db.collection("orders").aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: "$customerId", orders: { $sum: 1 }, spent: { $sum: "$total" }, lastOrderAt: { $max: "$createdAt" } } },
    { $match: { orders: { $gte: minOrders } } },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    { $sort: { spent: -1 } },
  ]).toArray();
  return rows.map((r) => ({ customerId: r._id, name: r.c.name, orders: r.orders, spent: r.spent, lastOrderAt: (r.lastOrderAt as Date).toISOString() }));
}
