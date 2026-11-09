// P25.7-E24
import type { Db } from "mongodb";

// דשבורד של טווח תאריכים — בבקשה אחת: הכנסות לפי יום (בשעון ישראל), ספירה לפי סטטוס, ו־3 המוצרים המובילים
export async function dashboard(db: Db, from: Date, to: Date) {
  const [result] = await db
    .collection("orders")
    .aggregate([
      { $match: { createdAt: { $gte: from, $lt: to } } },
      {
        $facet: {
          byDay: [
            { $match: { status: { $ne: "cancelled" } } },
            // היום לפי ישראל, לא לפי UTC: הזמנה ב־22:10Z ב־1.11 היא 2.11 בישראל (פרק 24)
            { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: "Asia/Jerusalem" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, day: "$_id", revenue: 1, orders: 1 } },
          ],
          byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }, { $sort: { _id: 1 } }],
          topProducts: [
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", units: { $sum: "$items.qty" } } },
            { $sort: { units: -1, _id: 1 } },
            { $limit: 3 },
            { $project: { _id: 0, productId: "$_id", units: 1 } },
          ],
        },
      },
    ])
    .toArray();
  return {
    byDay: result.byDay,
    byStatus: Object.fromEntries(result.byStatus.map((s: { _id: string; n: number }) => [s._id, s.n])),
    topProducts: result.topProducts,
  };
}
