import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeCustomers } = await load(import.meta.url, "P30-E14.ts");

test("אימייל או טלפון משותף — אותו אדם, גם בשרשרת", () => {
  const records = [
    { id: 1, email: "dana@x.com", phone: "050-1234567" },
    { id: 2, email: " DANA@X.com ", phone: null },
    { id: 3, email: "d.levi@y.com", phone: "+972 50 123 4567" },
    { id: 4, email: "yossi@x.com", phone: "052-7654321" },
    { id: 5, email: null, phone: "0527654321" },
    { id: 6, email: "noa@x.com", phone: "123" },
    { id: 7, email: "", phone: "" },
  ];
  assert.deepEqual(mergeCustomers(records), [[1, 2, 3], [4, 5], [6], [7]]);
});
test("ריקים ושגויים לא מחברים; קבוצות לפי ה־id הקטן", () => {
  assert.deepEqual(mergeCustomers([{ id: 9, email: "a@x" }, { id: 2, phone: "1" }, { id: 5, phone: "1" }]), [[2], [5], [9]]);
  assert.deepEqual(mergeCustomers([]), []);
});
test("20,000 רשומות בשרשרת אחת — מהר", () => {
  const recs = Array.from({ length: 20_000 }, (_, i) => ({ id: i + 1, email: `u${Math.floor(i / 2)}@x.com`, phone: `05${String(Math.floor((i + 1) / 2)).padStart(8, "0")}` }));
  const t0 = performance.now();
  const g = mergeCustomers(recs);
  assert.ok(performance.now() - t0 < 1500);
  assert.equal(g.length, 1);
  assert.equal(g[0].length, 20_000);
});
