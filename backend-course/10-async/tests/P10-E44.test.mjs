import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E44.js", ["predictOrder"]);
const s = (label) => ({ kind: "sync", label });
const p = (label) => ({ kind: "promise", label });
const t = (label, ms) => ({ kind: "timeout", label, ms });

test("הדוגמה מהשיעור", async () => {
  const { predictOrder } = await get();
  assert.deepEqual(predictOrder([s("1"), t("timeout", 0), p("promise"), s("2")]), ["1", "2", "promise", "timeout"]);
});
test("P10-E01: טיימרים בזמנים שונים", async () => {
  const { predictOrder } = await get();
  assert.deepEqual(predictOrder([s("A"), t("B", 100), t("C", 0), s("D"), t("E", 50)]), ["A", "D", "C", "E", "B"]);
});
test("כמה promises וטיימרים שווים — לפי הסדר", async () => {
  const { predictOrder } = await get();
  assert.deepEqual(
    predictOrder([t("t1", 10), p("p1"), t("t2", 0), p("p2"), t("t3", 10), s("s1")]),
    ["s1", "p1", "p2", "t2", "t1", "t3"],
  );
  assert.deepEqual(predictOrder([]), []);
});
test("סוג לא מוכר — שגיאה עם שם הסוג", async () => {
  const { predictOrder } = await get();
  assert.throws(() => predictOrder([s("a"), { kind: "interval", label: "x" }]), { message: "סוג לא מוכר: interval" });
});
