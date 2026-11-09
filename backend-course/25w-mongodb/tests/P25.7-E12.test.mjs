import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { createIndexes } = await load(import.meta.url, "P25.7-E12.ts");
const byName = async (db, col, name) => (await db.collection(col).indexes()).find((i) => i.name === name);
const stages = (plan) => JSON.stringify(plan);

test("האינדקסים קיימים, עם השמות והמפתחות", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await createIndexes(db);
  assert.deepEqual((await byName(db, "orders", "customer_recent"))?.key, { customerId: 1, createdAt: -1 });
  assert.deepEqual((await byName(db, "products", "category_price"))?.key, { category: 1, price: 1 });
  const ttl = await byName(db, "sessions", "sessions_ttl");
  assert.deepEqual(ttl?.key, { expiresAt: 1 });
  assert.equal(ttl?.expireAfterSeconds, 0);
});
test("השאילתה של 'ההזמנות האחרונות של לקוח' משתמשת באינדקס, בלי מיון בזיכרון", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await createIndexes(db);
  const ex = await db.collection("orders").find({ customerId: "c1" }).sort({ createdAt: -1 }).explain("executionStats");
  const plan = stages(ex.queryPlanner.winningPlan);
  assert.match(plan, /IXSCAN/);
  assert.doesNotMatch(plan, /"SORT"/, "המיון מגיע מהאינדקס");
  assert.equal(ex.executionStats.totalDocsExamined, 4, "רק 4 ההזמנות של c1");
});
test("אפשר להריץ פעמיים", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await createIndexes(db);
  await createIndexes(db);
});
