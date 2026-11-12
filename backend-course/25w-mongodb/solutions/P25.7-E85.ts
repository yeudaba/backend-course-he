// P25.7-E85: דוח קטגוריות ל־CSV
import type { Db } from "mongodb";

const cell = (v: unknown) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export async function categoryCsv(db: Db): Promise<string> {
  const rows = await db.collection("orders").aggregate([
    { $match: { status: { $in: ["delivered", "paid"] } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "p" } },
    { $unwind: "$p" },
    { $group: { _id: "$p.category", units: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  const lines = ["category,units,revenue", ...rows.map((r) => [r._id, r.units, r.revenue].map(cell).join(","))];
  return lines.join("\n") + "\n";
}
