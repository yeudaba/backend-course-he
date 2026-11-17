// P25.7-E53: עמוד הבא של הזמנות — keyset
import type { Db, Filter } from "mongodb";

type Order = { _id: string; createdAt: Date; total: number };

export async function ordersPage(db: Db, { limit, after }: { limit: number; after?: string }) {
  let filter: Filter<Order> = {};
  if (after !== undefined) {
    const parts = after.split("|");
    const t = new Date(parts[0]);
    if (parts.length !== 2 || !parts[1] || Number.isNaN(t.getTime())) throw new Error("BAD_CURSOR");
    filter = { $or: [{ createdAt: { $lt: t } }, { createdAt: t, _id: { $lt: parts[1] } }] };
  }
  const docs = await db.collection<Order>("orders")
    .find(filter, { projection: { createdAt: 1, total: 1 } })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();
  const items = docs.map((o) => ({ id: o._id, createdAt: o.createdAt.toISOString(), total: o.total }));
  const last = items.at(-1);
  return { items, next: items.length === limit && last ? `${last.createdAt}|${last.id}` : null };
}
