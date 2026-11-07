// P22-E15 — הבדיקות
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createTestSchema } from "./db-helper.ts";
import { ProductsRepository } from "./P22-E15.ts";

let db: Awaited<ReturnType<typeof createTestSchema>>;
let repo: ProductsRepository;

before(async () => {
  db = await createTestSchema();
  repo = new ProductsRepository(db.pool);
});
after(() => db.close());
beforeEach(() => db.reset());

test("create מחזיר את המוצר, עם מחיר כמספר", async () => {
  assert.deepEqual(await repo.create("Mug", 19.9), { id: 1, name: "Mug", price: 19.9 });
});

test("חיפוש בלי תלות באותיות", async () => {
  await repo.create("Espresso Cup", 25);
  await repo.create("Milk jug", 60);
  assert.deepEqual(await repo.search({ q: "CUP" }), [{ id: 1, name: "Espresso Cup", price: 25 }], "גם המחיר — מספר, לא \"25.00\"");
});

test("טווח מחירים — כולל הגבולות", async () => {
  for (const [name, price] of [["a", 10], ["b", 20], ["c", 30]] as const) await repo.create(name, price);
  assert.deepEqual((await repo.search({ minPrice: 10, maxPrice: 20 })).map((p) => p.name), ["a", "b"]);
  assert.deepEqual((await repo.search({ minPrice: 20, maxPrice: 30 })).map((p) => p.name), ["b", "c"]);
});

test("מיון לפי מחיר, ועמודים של 10", async () => {
  for (let i = 1; i <= 12; i++) await repo.create(`p${i}`, 100 - i); // הזול ביותר נוצר אחרון
  const first = await repo.search();
  assert.equal(first.length, 10);
  assert.equal(first[0].name, "p12");
  assert.deepEqual((await repo.search({ page: 2 })).map((p) => p.name), ["p2", "p1"]);
});
