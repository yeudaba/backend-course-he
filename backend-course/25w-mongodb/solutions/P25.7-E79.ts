// P25.7-E79: האינדקסים של החנות — ובדיקה ב־explain
import type { Db } from "mongodb";

export async function ensureShopIndexes(db: Db): Promise<void> {
  await db.collection("orders").createIndex({ customerId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ status: 1, createdAt: -1 });
  await db.collection("products").createIndex({ category: 1, price: 1 });
  await db.collection("products").createIndex({ tags: 1 });
  await db.collection("customers").createIndex({ email: 1 }, { unique: true });
}

export async function usesIndex(db: Db, filter: object, sort: object) {
  const ex = await db.collection("orders").find(filter).sort(sort as Record<string, 1 | -1>).explain("executionStats");
  const plan = JSON.stringify(ex.queryPlanner.winningPlan);
  return { ixscan: plan.includes("IXSCAN"), inMemorySort: plan.includes('"SORT"') };
}
