// P25.7-E77: הכנסות לפי יום — בשעון ישראל
import type { Db } from "mongodb";

export async function revenueByDay(db: Db, { timezone, from, to }: { timezone: string; from: Date; to: Date }) {
  return (await db.collection("orders").aggregate([
    { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } }, orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, day: "$_id", orders: 1, revenue: 1 } },
  ]).toArray()) as { day: string; orders: number; revenue: number }[];
}
