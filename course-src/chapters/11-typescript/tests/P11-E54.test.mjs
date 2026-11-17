import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E54.ts";
const get = () => exportsOf(import.meta.url, FILE, ["loadProducts", "cheapest"]);
const db = { 1: { id: 1, name: "עט", price: 5 }, 2: { id: 2, name: "מחברת", price: 12 }, 3: { id: 3, name: "מחק", price: 3 }, 4: { id: 4, name: "דבק", price: 3 } };
const slow = (ms) => (id) => new Promise((res, rej) => setTimeout(() => (db[id] ? res(db[id]) : rej(new Error(`אין מוצר ${id}`))), typeof ms === "function" ? ms(id) : ms));

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { loadProducts, cheapest } from "FILE";
import type { Product } from "FILE";
const getOne = async (id: number): Promise<Product> => ({ id, name: "x", price: 1 });
async function f() {
  const all: Product[] = await loadProducts([1], getOne);
  const c = await cheapest([1], getOne);
  // @ts-expect-error — cheapest יכולה להחזיר null
  const sure: Product = c;
  // @ts-expect-error — loadProducts מחזירה Promise, לא מערך
  const notAwaited: Product[] = loadProducts([1], getOne);
  // @ts-expect-error — getOne חייבת להחזיר Promise<Product>
  await loadProducts([1], (id: number) => id);
  return [all, sure, notAwaited];
}
export { f };
`);
  assert.ok(r.ok, r.message);
});
test("loadProducts — במקביל ולפי הסדר", async () => {
  const { loadProducts } = await get();
  const start = Date.now();
  const list = await loadProducts([2, 1, 3], slow((id) => (id === 2 ? 60 : 10)));
  assert.deepEqual(list.map((p) => p.id), [2, 1, 3], "התוצאה לפי סדר ה־ids, לא לפי מי שהגיע קודם");
  const ms = Date.now() - start;
  assert.ok(ms < 110, `לקח ${ms}ms — נראה שהמוצרים נטענים ברצף. Promise.all`);
  assert.deepEqual(await loadProducts([], slow(5)), []);
  await assert.rejects(loadProducts([1, 99], slow(5)), { message: "אין מוצר 99" });
});
test("cheapest", async () => {
  const { cheapest } = await get();
  assert.equal((await cheapest([1, 2, 3], slow(5)))?.name, "מחק");
  assert.equal((await cheapest([2, 4, 3], slow(5)))?.name, "דבק", "בשוויון — הראשון לפי סדר ה־ids");
  assert.equal(await cheapest([], slow(5)), null);
  await assert.rejects(cheapest([1, 42], slow(5)), { message: "אין מוצר 42" });
});
