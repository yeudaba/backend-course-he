import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

async function make(t) {
  const { MysqlProductsRepository } = await exportsOf(import.meta.url, "P25.5-E83.ts", ["MysqlProductsRepository"]);
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  return { repo: new MysqlProductsRepository(plainPool(t, db)), db };
}

test("findById", async (t) => {
  const { repo } = await make(t);
  assert.deepEqual(await repo.findById(6), { id: 6, name: "French Press 1L", category: "brewing", priceCents: 11900, stock: 25, isActive: true, attributes: { material: "glass", cups: 8 } });
  assert.deepEqual(await repo.findById(9), { id: 9, name: "Paper Filters (100)", category: "accessories", priceCents: 2490, stock: 300, isActive: true, attributes: null });
  assert.equal((await repo.findById(10)).isActive, false);
  assert.equal(await repo.findById(99), null);
});
test("list", async (t) => {
  const { repo } = await make(t);
  assert.deepEqual((await repo.list()).map((p) => p.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);
  assert.deepEqual((await repo.list({ category: "accessories" })).map((p) => p.id), [9]);
  assert.deepEqual((await repo.list({ category: "accessories", onlyActive: false })).map((p) => p.id), [9, 10]);
  assert.deepEqual((await repo.list({ limit: 3 })).map((p) => p.id), [1, 2, 3]);
  assert.deepEqual(await repo.list({ category: "nope" }), []);
  assert.equal(typeof (await repo.list())[0].priceCents, "number");
});
test("adjustStock", async (t) => {
  const { repo, db } = await make(t);
  assert.equal(await repo.adjustStock(5, -3), 0);
  await assert.rejects(repo.adjustStock(5, -1), { message: "OUT_OF_STOCK" });
  assert.equal(await repo.adjustStock(5, 10), 10);
  await assert.rejects(repo.adjustStock(99, 1), { message: "NOT_FOUND" });
  assert.deepEqual(await db.rows("SELECT stock FROM products WHERE id = 5"), [{ stock: 10 }]);
  await Promise.all(Array.from({ length: 15 }, () => repo.adjustStock(5, -1).catch(() => null)));
  assert.deepEqual(await db.rows("SELECT stock FROM products WHERE id = 5"), [{ stock: 0 }], "במקביל — לא יורד מתחת ל־0");
});
