import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { limitToolOutput, paginate } = await load(import.meta.url, "P29.5-E11.ts");

test("קצר ← כמו שהוא", () => {
  assert.equal(limitToolOutput("abc", { maxChars: 10 }), "abc");
  assert.equal(limitToolOutput("x".repeat(4000)), "x".repeat(4000));
});
test("ארוך ← התחלה (70%) וסוף (30%), עם הודעה כמה הושמט", () => {
  const text = "A".repeat(5000) + "B".repeat(5000);
  const out = limitToolOutput(text, { maxChars: 1000 });
  assert.ok(out.startsWith("A".repeat(700)) && !out.startsWith("A".repeat(701)));
  assert.ok(out.endsWith("B".repeat(300)) && !out.endsWith("B".repeat(301)));
  assert.match(out, /9000/);
  assert.match(out, /10000/);
  assert.ok(out.length < 1200);
});
test("paginate", () => {
  const items = Array.from({ length: 45 }, (_, i) => i);
  assert.deepEqual(paginate(items, { offset: 0, limit: 20 }), { items: items.slice(0, 20), total: 45, nextOffset: 20 });
  assert.deepEqual(paginate(items, { offset: 40, limit: 20 }), { items: [40, 41, 42, 43, 44], total: 45, nextOffset: null });
  assert.equal(paginate(items, { limit: 500 }).items.length, 45, "maxLimit 50");
  assert.equal(paginate(Array(200).fill(0), { limit: 500 }).items.length, 50);
  assert.throws(() => paginate(items, { offset: -1 }));
  assert.throws(() => paginate(items, { limit: 0 }));
});
