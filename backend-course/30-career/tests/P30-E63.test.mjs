import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { numbersToExplain } = await load(import.meta.url, "P30-E63.ts");

test("מספרים, יחידות ומשפטים", () => {
  const text = `## Projects
- Cut catalog search from ~80 ms to ~3ms with a Redis cache. Handled 10,000 requests in a load test!
* Built 22 endpoints in Node.js; 95% coverage
Since 2024, I improved p95 by 2.5x and wrote 140+ tests.`;
  assert.deepEqual(numbersToExplain(text), [
    { value: "80", unit: "ms", sentence: "Cut catalog search from ~80 ms to ~3ms with a Redis cache." },
    { value: "3", unit: "ms", sentence: "Cut catalog search from ~80 ms to ~3ms with a Redis cache." },
    { value: "10,000", unit: "", sentence: "Handled 10,000 requests in a load test!" },
    { value: "22", unit: "", sentence: "Built 22 endpoints in Node.js; 95% coverage" },
    { value: "95", unit: "%", sentence: "Built 22 endpoints in Node.js; 95% coverage" },
    { value: "95", unit: "", sentence: "Since 2024, I improved p95 by 2.5x and wrote 140+ tests." },
    { value: "2.5", unit: "x", sentence: "Since 2024, I improved p95 by 2.5x and wrote 140+ tests." },
    { value: "140", unit: "+", sentence: "Since 2024, I improved p95 by 2.5x and wrote 140+ tests." },
  ]);
});
test("קצוות", () => {
  assert.deepEqual(numbersToExplain(""), []);
  assert.deepEqual(numbersToExplain("No numbers here."), []);
  assert.deepEqual(numbersToExplain("2019–2026 at Acme"), []);
  assert.deepEqual(numbersToExplain("Grew to 2000 users"), [], "‏2000 נראה כמו שנה — מדלגים");
  assert.deepEqual(numbersToExplain("Grew to 2000+ users"), [{ value: "2000", unit: "+", sentence: "Grew to 2000+ users" }]);
  assert.deepEqual(numbersToExplain("Served 3k users"), [{ value: "3", unit: "k", sentence: "Served 3k users" }]);
});
