import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P29.5-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["renderTrace"])).renderTrace;
const span = (id, parentId, name, start, end) => ({ id, parentId, name, start, end });

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עץ: הזחה של שני רווחים לכל רמה, ילדים לפי זמן התחלה", async () => {
  const renderTrace = await get();
  const out = renderTrace([
    span("t3", "t2", "tool:search_orders", 1210, 1290),
    span("t1", null, "agent.run", 1000, 2950),
    span("t2", "t1", "llm.call#1", 1005, 1200),
    span("t5", "t1", "llm.call#2", 1300, 2900),
    span("t4", "t2", "tool:get_order", 1210, 1250),
  ]);
  assert.equal(out, [
    "agent.run                         1950ms",
    "  llm.call#1                       195ms",
    "    tool:get_order                  40ms",
    "    tool:search_orders              80ms",
    "  llm.call#2                      1600ms",
  ].join("\n"), "שם (עם ההזחה) עד 32 תווים עם padEnd, ומשך עד 8 תווים עם padStart; באותה שעת התחלה — לפי שם");
});
test("כמה שורשים, והורה שלא נמצא ב־trace", async () => {
  const renderTrace = await get();
  const out = renderTrace([
    span("b", null, "second", 50, 60),
    span("x", "missing", "orphan", 20, 25),
    span("a", null, "first", 10, 30),
    span("c", "a", "child", 11, 12),
  ]).split("\n").map((l) => l.trimEnd().replace(/\s+/g, " "));
  assert.deepEqual(out, ["first 20ms", " child 1ms", "orphan 5ms", "second 10ms"], "span שההורה שלו לא ב־trace מוצג כשורש — לא נעלם");
  assert.equal(renderTrace([]), "");
});
test("עומק — רקורסיה (או מחסנית), לא רק שתי רמות", async () => {
  const renderTrace = await get();
  const deep = Array.from({ length: 6 }, (_, i) => span(`s${i}`, i === 0 ? null : `s${i - 1}`, `level${i}`, i, 100));
  const lines = renderTrace(deep).split("\n");
  assert.equal(lines.length, 6);
  assert.ok(lines[5].startsWith("          level5"), `רמה 5 — 10 רווחים לפני השם: "${lines[5]}"`);
});
