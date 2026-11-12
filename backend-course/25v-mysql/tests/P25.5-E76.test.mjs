import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E76.ts", ["productsByIds"])).productsByIds;

test("לפי הסדר, בלי כפילויות, בלי חסרים", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  assert.deepEqual(await f(pool, [6, 1, 99, 6, 9]), [
    { id: 6, name: "French Press 1L", priceCents: 11900 },
    { id: 1, name: "Ethiopia Beans 1kg", priceCents: 8990 },
    { id: 9, name: "Paper Filters (100)", priceCents: 2490 },
  ]);
  assert.deepEqual(await f(pool, [99]), []);
});
test("רשימה ריקה — בלי מסד", async () => {
  const f = await get();
  const fake = { query: () => { throw new Error("לא אמור לפנות למסד"); }, execute: () => { throw new Error("לא אמור לפנות למסד"); } };
  assert.deepEqual(await f(fake, []), []);
});
test("שאילתה אחת", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  let calls = 0;
  const spy = { query: (...a) => { calls++; return pool.query(...a); }, execute: (...a) => { calls++; return pool.execute(...a); } };
  await f(spy, [1, 2, 3, 4, 5]);
  assert.equal(calls, 1);
});
