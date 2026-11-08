import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRing } = await load(import.meta.url, "P28-E13.ts");
const keys = Array.from({ length: 20_000 }, (_, i) => `user:${i}`);

test("ריק ← null; שרת אחד ← הכול אליו", () => {
  const r = createRing();
  assert.equal(r.get("x"), null);
  r.add("db0");
  assert.ok(keys.slice(0, 100).every((k) => r.get(k) === "db0"));
});
test("פיזור סביר עם virtual nodes", () => {
  const r = createRing({ vnodes: 100 });
  for (const n of ["db0", "db1", "db2", "db3"]) r.add(n);
  const count = new Map();
  for (const k of keys) count.set(r.get(k), (count.get(r.get(k)) ?? 0) + 1);
  assert.equal(count.size, 4);
  for (const [n, c] of count) assert.ok(c > 20_000 * 0.15 && c < 20_000 * 0.35, `${n}: ${c} מפתחות — רחוק מדי מרבע`);
});
test("הוספת שרת מזיזה רק מפתחות אליו (כ־1/n)", () => {
  const r = createRing();
  for (const n of ["db0", "db1", "db2", "db3"]) r.add(n);
  const before = new Map(keys.map((k) => [k, r.get(k)]));
  r.add("db4");
  let moved = 0;
  for (const k of keys) {
    const now = r.get(k);
    if (now !== before.get(k)) {
      moved++;
      assert.equal(now, "db4", "מפתח שזז — עובר רק לשרת החדש");
    }
  }
  assert.ok(moved / keys.length > 0.1 && moved / keys.length < 0.3, `זזו ${((moved / keys.length) * 100).toFixed(1)}% — צפוי כ־20%`);
});
test("הסרה — המפתחות של השרת מתפזרים, השאר לא זזים; add כפול לא משנה", () => {
  const r = createRing();
  for (const n of ["db0", "db1", "db2"]) r.add(n);
  r.add("db1");
  const before = new Map(keys.map((k) => [k, r.get(k)]));
  r.remove("db1");
  for (const k of keys) {
    if (before.get(k) !== "db1") assert.equal(r.get(k), before.get(k));
    else assert.notEqual(r.get(k), "db1");
  }
  assert.deepEqual(r.nodes().sort(), ["db0", "db2"]);
});
