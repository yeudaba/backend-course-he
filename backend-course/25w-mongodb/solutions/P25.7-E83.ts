// P25.7-E83: התגיות הפופולריות
import type { Db } from "mongodb";

export async function popularTags(db: Db, limit: number) {
  return (await db.collection("products").aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", products: { $sum: 1 }, inStock: { $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } } } },
    { $sort: { products: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, tag: "$_id", products: 1, inStock: 1 } },
  ]).toArray()) as { tag: string; products: number; inStock: number }[];
}
