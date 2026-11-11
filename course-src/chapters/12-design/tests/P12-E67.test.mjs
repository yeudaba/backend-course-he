import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E67.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["SearchService"])).SearchService;
const products = [
  { id: 1, name: "Pen", price: 5 },
  { id: 2, name: "Pencil", price: 3 },
  { id: 3, name: "Notebook", price: 12 },
  { id: 4, name: "Fountain pen", price: 120 },
  { id: 5, name: "Eraser", price: 3 },
  { id: 6, name: "Bag", price: 0 },
];
const repo = { async findAll() { return products.map((p) => ({ ...p })); } };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { SearchService } from "FILE";
import type { ProductRepository, Product } from "FILE";
const repo: ProductRepository = { async findAll(): Promise<Product[]> { return []; } };
const s = new SearchService(repo);
const p: Promise<{ items: Product[]; total: number }> = s.search({});
s.search({ text: "a", minPrice: 1, maxPrice: 2, page: 1, pageSize: 5 });
// @ts-expect-error — minPrice הוא מספר
s.search({ minPrice: "1" });
export { p };
`);
  assert.ok(r.ok, r.message);
});
test("בלי סינון — הכול, ממוין לפי מחיר ואז שם", async () => {
  const SearchService = await get();
  const r = await new SearchService(repo).search({});
  assert.equal(r.total, 6);
  assert.deepEqual(r.items.map((p) => p.id), [6, 5, 2, 1, 3, 4], "מחיר עולה; בשוויון (3) — Eraser לפני Pencil");
});
test("טקסט ומחירים", async () => {
  const SearchService = await get();
  const s = new SearchService(repo);
  const a = await s.search({ text: " PEN", maxPrice: 100 });
  assert.deepEqual(a, { items: [{ id: 2, name: "Pencil", price: 3 }, { id: 1, name: "Pen", price: 5 }], total: 2 });
  assert.equal((await s.search({ minPrice: 0, maxPrice: 3 })).total, 3, "כולל הקצוות, ו־0 הוא מינימום תקין");
  assert.deepEqual((await s.search({ minPrice: 5, maxPrice: 12 })).items.map((p) => p.id), [1, 3]);
  assert.equal((await s.search({ text: "   " })).total, 6, "טקסט ריק — הכול");
  assert.deepEqual(await s.search({ text: "zzz" }), { items: [], total: 0 });
});
test("עמודים", async () => {
  const SearchService = await get();
  const s = new SearchService(repo);
  const p2 = await s.search({ page: 2, pageSize: 4 });
  assert.equal(p2.total, 6, "total — לפני החיתוך לעמוד");
  assert.deepEqual(p2.items.map((p) => p.id), [3, 4]);
  assert.deepEqual((await s.search({ page: 3, pageSize: 4 })).items, []);
  assert.deepEqual((await s.search({ pageSize: 2 })).items.map((p) => p.id), [6, 5]);
});
