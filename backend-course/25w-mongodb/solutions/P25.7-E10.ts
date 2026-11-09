// P25.7-E10
import type { Db } from "mongodb";

export async function productsPage(db: Db, { page = 1, pageSize = 3, category }: { page?: number; pageSize?: number; category?: string } = {}) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new RangeError("page/pageSize לא תקינים");
  const filter = category === undefined ? {} : { category };
  const col = db.collection("products");
  // שתי שאילתות במקביל: העמוד עצמו, והספירה (באותו filter!)
  const [items, total] = await Promise.all([
    col.find(filter, { projection: { name: 1, price: 1 } }).sort({ name: 1, _id: 1 }).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    col.countDocuments(filter),
  ]);
  return { items, total, totalPages: Math.ceil(total / pageSize) };
}
