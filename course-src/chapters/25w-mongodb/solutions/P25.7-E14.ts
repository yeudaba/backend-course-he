// P25.7-E14
import type { Db } from "mongodb";

export async function salesByProduct(db: Db) {
  return db
    .collection("orders")
    .aggregate([
      { $match: { status: { $in: ["paid", "delivered"] } } }, // קודם מסננים — פחות מסמכים לשלבים הבאים
      { $unwind: "$items" }, // מסמך לכל פריט
      { $group: { _id: "$items.productId", name: { $first: "$items.name" }, units: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
      { $sort: { revenue: -1, _id: 1 } },
      { $project: { _id: 0, productId: "$_id", name: 1, units: 1, revenue: 1 } },
    ])
    .toArray();
}
