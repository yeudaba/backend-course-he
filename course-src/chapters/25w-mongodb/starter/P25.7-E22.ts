// P25.7-E22: כמה יחידות נמכרו מכל קטגוריה (הזמנות ששולמו או נמסרו). שלוש תקלות
import type { Db } from "mongodb";

export async function unitsByCategory(db: Db) {
  return db
    .collection("orders")
    .aggregate([
      { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $group: { _id: "$product.category", units: { $sum: 1 }, status: { $first: "$status" } } },
      { $match: { status: { $in: ["paid", "delivered"] } } },
      { $sort: { units: -1, _id: 1 } },
      { $project: { _id: 0, category: "$_id", units: 1 } },
    ])
    .toArray();
}
