// P25.7-E22
import type { Db } from "mongodb";

// כמה יחידות נמכרו מכל קטגוריה (הזמנות ששולמו או נמסרו)
export async function unitsByCategory(db: Db) {
  return db
    .collection("orders")
    .aggregate([
      { $match: { status: { $in: ["paid", "delivered"] } } }, // תקלה 1: לסנן לפני ה־$group — אחריו כבר אין status
      { $unwind: "$items" }, // תקלה 2: בלי $unwind, "$items.qty" הוא מערך, ו־$sum של מערך הוא 0
      { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $group: { _id: "$product.category", units: { $sum: "$items.qty" } } }, // תקלה 3: qty, לא 1 (1 סופר שורות)
      { $sort: { units: -1, _id: 1 } },
      { $project: { _id: 0, category: "$_id", units: 1 } },
    ])
    .toArray();
}
