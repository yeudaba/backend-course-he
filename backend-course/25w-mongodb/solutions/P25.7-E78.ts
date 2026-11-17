// P25.7-E78: הזמנות לפי סטטוס — עם אחוזים
import type { Db } from "mongodb";

export async function ordersByStatus(db: Db) {
  const rows = (await db.collection("orders").aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]).toArray()) as { _id: string; count: number }[];
  const total = rows.reduce((s, r) => s + r.count, 0);
  return rows.map((r) => ({ status: r._id, count: r.count, percent: Math.round((r.count / total) * 1000) / 10 }));
}
