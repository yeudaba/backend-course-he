import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { PrismaProductsRepository } = await load(import.meta.url, "P19-E24.ts");

test("list", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const repo = new PrismaProductsRepository(prisma);
  let r = await repo.list({});
  assert.equal(r.total, 12);
  assert.deepEqual(r.data[0], { id: 3, name: "Brazil Beans 250g", category: "beans", price: 29.9, stock: 120, isActive: true });
  r = await repo.list({ category: "brewing", sort: "-price" });
  assert.deepEqual(r.data.map((p) => p.id), [12, 8, 6, 7]);
  r = await repo.list({ inStock: true, sort: "price", limit: 3, page: 2 });
  assert.equal(r.total, 9);
  assert.deepEqual(r.data.map((p) => p.id), [1, 6, 8]);
  assert.deepEqual((await repo.list({ q: "GRIND" })).data.map((p) => p.name), ["Electric Grinder Pro", "Hand Grinder"]);
});
test("get / create / update / remove", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const repo = new PrismaProductsRepository(prisma);
  assert.equal((await repo.get(4)).category, "grinders");
  assert.equal(await repo.get(99), undefined);
  const p = await repo.create({ name: "AeroPress", category: "brewing", price: 139, stock: 20 });
  assert.deepEqual(p, { id: 13, name: "AeroPress", category: "brewing", price: 139, stock: 20, isActive: true });
  await assert.rejects(repo.create({ name: "X", category: "tea", price: 1, stock: 1 }), (e) => e.code === "CATEGORY_NOT_FOUND");
  assert.deepEqual(await repo.update(13, { price: 129, category: "accessories" }), { ...p, price: 129, category: "accessories" });
  assert.equal(await repo.update(99, { price: 1 }), undefined);
  await assert.rejects(repo.update(13, { category: "tea" }), (e) => e.code === "CATEGORY_NOT_FOUND");
  assert.equal(await repo.remove(13), true);
  assert.equal(await repo.remove(13), false);
  await assert.rejects(repo.remove(1), (e) => e.code === "PRODUCT_HAS_ORDERS");
});
