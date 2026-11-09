// P25.7-E15
import type { Db } from "mongodb";

export async function topCustomers(db: Db, n = 3) {
  return db
    .collection("orders")
    .aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$customerId", spent: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { spent: -1, _id: 1 } },
      { $limit: n }, // לפני ה־$lookup: מצטרפים רק ל־n לקוחות, לא לכולם
      { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "customer" } },
      { $unwind: "$customer" },
      { $project: { _id: 0, customerId: "$_id", name: "$customer.name", spent: 1, orders: 1 } },
    ])
    .toArray();
}
