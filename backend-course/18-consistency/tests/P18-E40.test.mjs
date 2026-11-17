import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E40.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["applyAll"])).applyAll;
const start = () => new Map([["dana", 1000], ["yossi", 250], ["noa", 0]]);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כל הפעולות, מדויק, ו־Map חדש", async () => {
  const applyAll = await get();
  const b = start();
  const out = applyAll(b, [{ from: "dana", to: "noa", amount: 0.1 }, { from: "dana", to: "noa", amount: 0.2 }, { from: "yossi", to: "dana", amount: 250 }]);
  assert.deepEqual([...out], [["dana", 1249.7], ["yossi", 0], ["noa", 0.3]], "0.1 + 0.2 = 0.3; היתרה של yossi יכולה להגיע בדיוק ל־0");
  assert.notEqual(out, b, "מחזירה Map חדש");
  assert.deepEqual([...b], [...start()], "המקור לא השתנה");
  assert.deepEqual([...applyAll(b, [])], [...start()]);
});
test("שגיאה — המקור לא נגוע", async () => {
  const applyAll = await get();
  const b = start();
  const ok = { from: "dana", to: "noa", amount: 100 };
  assert.throws(() => applyAll(b, [ok, { from: "yossi", to: "noa", amount: 250.01 }]), { message: "אין מספיק כסף: yossi" });
  assert.throws(() => applyAll(b, [ok, { from: "dana", to: "avi", amount: 1 }]), { message: "חשבון לא קיים: avi" });
  assert.throws(() => applyAll(b, [{ from: "ghost", to: "noa", amount: 1 }]), { message: "חשבון לא קיים: ghost" });
  assert.throws(() => applyAll(b, [ok, { from: "dana", to: "noa", amount: 0 }]), { message: "סכום לא חוקי" });
  assert.throws(() => applyAll(b, [{ from: "dana", to: "noa", amount: -5 }]), { message: "סכום לא חוקי" });
  assert.throws(() => applyAll(b, [{ from: "dana", to: "noa", amount: NaN }]), { message: "סכום לא חוקי" });
  assert.deepEqual([...b], [...start()], "אחרי כל הכישלונות — המקור כמו בהתחלה");
});
