import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { target } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E79.ts", ["orderWithItems"])).orderWithItems;
const ORDER1 = {
  id: 1, status: "paid", totalCents: 27890, createdAt: "2026-03-01T09:00:00.000Z",
  items: [{ productId: 1, name: "Ethiopia Beans 1kg", quantity: 1, unitPriceCents: 8990 }, { productId: 4, name: "Hand Grinder", quantity: 1, unitPriceCents: 18900 }],
};

test("הזמנה עם פריטים", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  assert.deepEqual(await f(pool, 1), ORDER1);
  assert.deepEqual((await f(pool, 4)).items, [{ productId: 6, name: "French Press 1L", quantity: 2, unitPriceCents: 11900 }]);
  assert.equal(await f(pool, 99), null);
  let calls = 0;
  const spy = { query: (...a) => { calls++; return pool.query(...a); }, execute: (...a) => { calls++; return pool.execute(...a); } };
  await f(spy, 1);
  assert.equal(calls, 1, "שאילתה אחת");
});
test("לא תלוי ב־TZ של התהליך", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const file = pathToFileURL(target(import.meta.url, "P25.5-E79.ts")).href;
  const code = `import mysql from "mysql2/promise"; const m = await import(${JSON.stringify(file)}); const p = mysql.createPool(${JSON.stringify(db.url)}); console.log(JSON.stringify(await m.orderWithItems(p, 1))); await p.end();`;
  const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", code], { encoding: "utf8", env: { ...process.env, TZ: "Asia/Jerusalem" }, cwd: new URL(".", import.meta.url).pathname });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout.trim().split("\n").at(-1)).createdAt, ORDER1.createdAt, "עם TZ=Asia/Jerusalem");
});
