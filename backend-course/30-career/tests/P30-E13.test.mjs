import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { log } from "./_log.mjs";

const { latencyReport } = await load(import.meta.url, "P30-E13.ts");

test("קיבוץ לפי method ונתיב מנורמל; p95; שיעור שגיאות", () => {
  const r = latencyReport(log);
  assert.equal(r.skipped, 1, "שורה לא תקינה — נספרת; שורה ריקה — לא");
  assert.deepEqual(r.endpoints, [
    { endpoint: "GET /orders/:id", count: 2, p95: 1000, errorRate: 0.5 },
    { endpoint: "POST /orders", count: 3, p95: 900, errorRate: 0.333 },
    { endpoint: "GET /products", count: 20, p95: 190, errorRate: 0 },
    { endpoint: "GET /orders/:id/items", count: 1, p95: 90, errorRate: 0 },
  ]);
});
test("מספרים ממוינים כמספרים (1000 אחרי 200)", () => {
  const r = latencyReport(["t GET /a 200 1000ms", "t GET /a 200 200ms", "t GET /a 200 30ms"]);
  assert.equal(r.endpoints[0].p95, 1000);
});
test("100,000 שורות — מהר", () => {
  const big = Array.from({ length: 100_000 }, (_, i) => `t GET /products/${i % 500} ${i % 50 ? 200 : 500} ${i % 997}ms`);
  const t0 = performance.now();
  const r = latencyReport(big);
  assert.ok(performance.now() - t0 < 1500, "O(n log n) — לא לסרוק את כל הלוג לכל endpoint");
  assert.equal(r.endpoints[0].count, 100_000);
  assert.equal(r.endpoints[0].errorRate, 0.02);
});
