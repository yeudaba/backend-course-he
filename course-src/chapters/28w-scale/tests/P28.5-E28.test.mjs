import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P28.5-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["report"])).report;
const RESULTS = [
  { name: "express + pg", requests: 182_400, seconds: 30, p50: 4.2, p99: 31.75 },
  { name: "fastify + pg", requests: 297_300, seconds: 30, p50: 2.61, p99: 18.4 },
  { name: "express + cache", requests: 1_204_500, seconds: 30, p50: 0.8, p99: 6.04 },
];

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטבלה המלאה", async () => {
  const report = await get();
  const lines = report(RESULTS).split("\n");
  assert.equal(lines.length, 4, "כותרת ושורה לכל תוצאה");
  assert.equal(lines[0], "name              req/s  p50 ms  p99 ms", "כותרת: name, req/s, p50 ms, p99 ms ועמודה ריקה — ובלי רווחים בסוף השורה");
  assert.equal(lines[1], "express + cache  40,150     0.8     6.0  fastest", "המהיר ראשון; req/s מעוגל עם פסיקים; ms עם ספרה אחת");
  assert.equal(lines[2], "fastify + pg      9,910     2.6    18.4  4.05x slower");
  assert.equal(lines[3], "express + pg      6,080     4.2    31.8  6.60x slower", "פי כמה איטי — שתי ספרות אחרי הנקודה");
});
test("רוחב העמודות לפי התוכן הארוך, ושורה אחת", async () => {
  const report = await get();
  assert.equal(report([{ name: "a", requests: 10, seconds: 1, p50: 1, p99: 2 }]), "name  req/s  p50 ms  p99 ms\na        10     1.0     2.0  fastest");
  const two = report([
    { name: "x", requests: 1000, seconds: 1, p50: 1, p99: 1 },
    { name: "a-very-long-name", requests: 1_000_000, seconds: 1, p50: 1234.56, p99: 99999 },
  ]);
  assert.equal(two, ["name                  req/s  p50 ms   p99 ms", "a-very-long-name  1,000,000  1234.6  99999.0  fastest", "x                     1,000     1.0      1.0  1000.00x slower"].join("\n"));
  assert.equal(report([]), "", "בלי תוצאות — מחרוזת ריקה");
});
test("לא משנה את הקלט", async () => {
  const report = await get();
  const input = structuredClone(RESULTS);
  report(input);
  assert.deepEqual(input, RESULTS, "המיון — על עותק");
});
