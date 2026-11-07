import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { listOrders } = await load(import.meta.url, "P18-E18.ts");

test("keyset pagination", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  const first = await listOrders(pool, { limit: 3 });
  assert.deepEqual(first.data.map((o) => o.id), [1, 2, 3]);
  assert.equal(typeof first.data[0].total, "number");
  assert.equal(first.nextCursor, 3);
  const second = await listOrders(pool, { after: first.nextCursor, limit: 3 });
  assert.deepEqual(second.data.map((o) => o.id), [4, 5, 6]);
  assert.equal((await listOrders(pool)).data.length, 20, "ברירת מחדל 20");
  const exact = await listOrders(pool, { after: 199997, limit: 3 });
  assert.deepEqual(exact.data.map((o) => o.id), [199998, 199999, 200000]);
  assert.equal(exact.nextCursor, null, "בדיוק 3 נשארו ← אין עוד");
  const last = await listOrders(pool, { after: 199998, limit: 5 });
  assert.deepEqual(last.data.map((o) => o.id), [199999, 200000]);
  assert.equal(last.nextCursor, null);
  assert.deepEqual(await listOrders(pool, { after: 200000 }), { data: [], nextCursor: null });
  await assert.rejects(listOrders(pool, { limit: 0 }), RangeError);
  await assert.rejects(listOrders(pool, { limit: 101 }), RangeError);
});
