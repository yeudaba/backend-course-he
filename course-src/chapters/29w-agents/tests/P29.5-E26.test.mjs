import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P29.5-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["stableKey", "LoopGuard"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("stableKey — אותו מפתח לאותו תוכן, בכל סדר של שדות ובכל עומק", async () => {
  const { stableKey } = await get();
  assert.equal(stableKey({ b: 1, a: 2 }), stableKey({ a: 2, b: 1 }));
  assert.equal(stableKey({ x: { d: [1, { q: 1, p: 2 }], c: null } }), stableKey({ x: { c: null, d: [1, { p: 2, q: 1 }] } }), "גם בתוך אובייקטים ומערכים");
  assert.notEqual(stableKey([1, 2]), stableKey([2, 1]), "במערך הסדר כן משנה");
  assert.notEqual(stableKey({ a: "1" }), stableKey({ a: 1 }), "מחרוזת ומספר — שונים");
  assert.notEqual(stableKey({ a: 1 }), stableKey({ a: 1, b: 2 }));
  assert.equal(stableKey({ a: 2, b: 1 }), '{"a":2,"b":1}', "הפורמט: כמו JSON.stringify, עם מפתחות ממוינים");
  assert.equal(stableKey("שלום"), '"שלום"');
});
test("LoopGuard — חזרה על אותה קריאה", async () => {
  const { LoopGuard } = await get();
  const g = new LoopGuard({ maxSteps: 100, maxRepeats: 2, maxCostUsd: 10 });
  assert.deepEqual(g.check("search", { email: "d@x.com", status: "open" }, 0), { ok: true });
  assert.deepEqual(g.check("search", { status: "open", email: "d@x.com" }, 0), { ok: true }, "פעם שנייה (סדר שדות אחר — אותה קריאה)");
  assert.deepEqual(g.check("get", { email: "d@x.com", status: "open" }, 0), { ok: true }, "כלי אחר עם אותו קלט — קריאה אחרת");
  const v = g.check("search", { email: "d@x.com", status: "open" }, 0);
  assert.equal(v.ok, false);
  assert.equal(v.reason, "repeat");
  assert.equal(typeof v.message, "string");
  assert.deepEqual(g.check("search", { email: "d@x.com", status: "closed" }, 0), { ok: true }, "קלט אחר — בסדר");
});
test("LoopGuard — צעדים ועלות, ו־getters", async () => {
  const { LoopGuard } = await get();
  const g = new LoopGuard({ maxSteps: 3, maxRepeats: 10, maxCostUsd: 1 });
  for (let i = 0; i < 3; i++) assert.equal(g.check("t", { i }, 0.1).ok, true);
  assert.equal(g.check("t", { i: 99 }, 0.1).reason, "steps", "הצעד הרביעי עם maxSteps: 3");
  assert.equal(g.steps, 4);
  assert.equal(g.costUsd, 0.4, "costUsd מעוגל — 0.1 + 0.1 + 0.1 + 0.1 ב־JavaScript הוא 0.4000000000000001");
  const c = new LoopGuard({ maxSteps: 100, maxRepeats: 10, maxCostUsd: 0.25 });
  assert.equal(c.check("a", 1, 0.2).ok, true);
  assert.equal(c.check("b", 2, 0.05).ok, true, "בדיוק 0.25 — עוד מותר");
  assert.equal(c.check("c", 3, 0.01).reason, "cost");
  assert.deepEqual(Object.keys(c), [], "שדות פרטיים (#)");
});
