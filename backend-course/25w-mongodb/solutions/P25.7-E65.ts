// P25.7-E65: $lookup — הזמנות עם שם הלקוח
import type { Db } from "mongodb";

export async function ordersWithCustomer(db: Db, status: string) {
  return (await db.collection("orders").aggregate([
    { $match: { status } },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
    { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, orderId: "$_id", customerName: { $ifNull: ["$customer.name", null] }, total: 1 } },
  ]).toArray()) as { orderId: string; customerName: string | null; total: number }[];
}
