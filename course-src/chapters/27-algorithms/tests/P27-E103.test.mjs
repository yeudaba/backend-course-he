import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { topSpenders } = await load(import.meta.url, "P27-E103.ts");
const customers = [{ id: 1, name: "Noa" }, { id: 2, name: "Avi" }, { id: 3, name: "Dana" }, { id: 4, name: "Gal" }];
const orders = [{ customerId: 1, total: 100 }, { customerId: 2, total: 60 }, { customerId: 3, total: 80 }, { customerId: 1, total: 20 }, { customerId: 2, total: 60 }, { customerId: 3, total: 20 }];

test("לפחות הסף, מהגבוה, בשוויון לפי שם", () => {
  assert.deepEqual(topSpenders(customers, orders, 100), [{ name: "Avi", total: 120 }, { name: "Noa", total: 120 }, { name: "Dana", total: 100 }], "Dana הוציאה בדיוק 100 — 'לפחות'");
  assert.deepEqual(topSpenders(customers, orders, 0).at(-1), { name: "Gal", total: 0 }, "לקוח בלי הזמנות — 0");
  assert.deepEqual(topSpenders(customers, [], 1), []);
});
test("5,000 לקוחות ו־50,000 הזמנות — מהר", () => {
  const cs = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `c${String(i + 1).padStart(4, "0")}` }));
  const os = Array.from({ length: 50000 }, (_, i) => ({ customerId: (i * 7919) % 5000 + 1, total: (i % 13) + 1 }));
  let r;
  fastEnough(() => (r = topSpenders(cs, os, 75)), 400, "topSpenders על 5,000 × 50,000");
  assert.ok(r.length > 0);
  assert.ok(r.every((x, i) => i === 0 || r[i - 1].total > x.total || (r[i - 1].total === x.total && r[i - 1].name < x.name)), "הסדר: total יורד, ובשוויון — שם עולה");
});
