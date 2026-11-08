import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { dedupeCustomers } = await load(import.meta.url, "P27-E21.ts");
const list = () => [
  { id: 7, name: "Dana", email: "dana@example.com" },
  { id: 2, name: "Yossi", email: "yossi@example.com" },
  { id: 5, name: "Dana L.", email: "DANA@example.com " },
  { id: 1, name: "Noa", email: "noa@example.com" },
];

test("email זהה (בלי רישיות ורווחים) ← נשאר הראשון", () => {
  assert.deepEqual(dedupeCustomers(list()).map((c) => c.id), [7, 2, 1]);
});
test("הסדר נשמר כמו בקלט, והקלט לא משתנה", () => {
  const input = list();
  const before = JSON.stringify(input);
  const out = dedupeCustomers(input);
  assert.equal(JSON.stringify(input), before, "הקלט לא השתנה");
  assert.deepEqual(out.map((c) => c.name), ["Dana", "Yossi", "Noa"]);
});
test("50,000 לקוחות — מהר", () => {
  const many = Array.from({ length: 50_000 }, (_, i) => ({ id: i, name: `c${i}`, email: `c${i % 40_000}@example.com` }));
  const out = fastEnough(() => dedupeCustomers(many), 300, "dedupeCustomers על 50,000 לקוחות");
  assert.equal(out.length, 40_000);
});
