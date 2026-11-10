import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P15-E28.ts";
const catalog = () =>
  new Map([
    ["PEN", { name: "עט", price: 450 }],
    ["CUP", { name: "כוס", price: 1990 }],
    ["BAG", { name: "תיק", price: 12900 }],
  ]);

async function start(t) {
  const { createApp } = await exportsOf(import.meta.url, FILE, ["createApp"]);
  const { base, close } = await listen(createApp(catalog()));
  t.after(close);
  const call = api(base);
  return (body) => call("POST", "/cart/total", body);
}

test("עובר בדיקת טיפוסים, ומייצא type Product", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { createApp, type Product } from "FILE";
const p: Product = { name: "עט", price: 450 };
createApp(new Map([["PEN", p]]));
// @ts-expect-error — catalog הוא Map, לא אובייקט רגיל
createApp({ PEN: p });
`);
  assert.ok(p.ok, p.message);
});
test("שורות וסכום", async (t) => {
  const post = await start(t);
  const r = await post({ items: [{ sku: "CUP", qty: 2 }, { sku: "PEN", qty: 3 }] });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, {
    lines: [
      { sku: "CUP", name: "כוס", qty: 2, subtotal: 3980 },
      { sku: "PEN", name: "עט", qty: 3, subtotal: 1350 },
    ],
    total: 5330,
  });
});
test("אותו sku פעמיים — שורה אחת, לפי סדר ההופעה הראשונה", async (t) => {
  const post = await start(t);
  const r = await post({ items: [{ sku: "PEN", qty: 2 }, { sku: "BAG", qty: 1 }, { sku: "PEN", qty: 1 }, { sku: "BAG", qty: 2 }] });
  assert.deepEqual(r.body?.lines?.map((l) => [l.sku, l.qty]), [["PEN", 3], ["BAG", 3]], "קבץ לפי sku עם Map");
  assert.equal(r.body.total, 450 * 3 + 12900 * 3);
});
test("מוצר שלא קיים — 404", async (t) => {
  const post = await start(t);
  const r = await post({ items: [{ sku: "PEN", qty: 1 }, { sku: "BOOK", qty: 1 }] });
  assert.equal(r.status, 404);
  assert.deepEqual(r.body, { error: "מוצר לא קיים: BOOK" });
});
test("קלט לא תקין — 400", async (t) => {
  const post = await start(t);
  const bad = [
    {},
    { items: [] },
    { items: "PEN" },
    { items: [{ sku: "", qty: 1 }] },
    { items: [{ sku: "PEN", qty: 0 }] },
    { items: [{ sku: "PEN", qty: 1.5 }] },
    { items: [{ sku: "PEN", qty: 100 }] },
    { items: [{ sku: "PEN", qty: "2" }] },
  ];
  for (const body of bad) {
    const r = await post(body);
    assert.equal(r.status, 400, `גוף ${JSON.stringify(body)} צריך להחזיר 400`);
    assert.deepEqual(r.body, { error: "קלט לא תקין" });
  }
});
test("Map ו־reduce", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /new\s+Map\b/, "התרגיל מתרגל קיבוץ עם Map (פרק 7)");
  assert.match(src, /\.reduce\s*\(/, "התרגיל מתרגל reduce (פרק 6) לחישוב total");
});
