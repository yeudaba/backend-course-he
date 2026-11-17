import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E70.ts", ["each"])).each;

test("שמות וארגומנטים", async () => {
  const each = await get();
  const seen = [];
  const tests = each([[1, 2, 3], [0, 0, 0], [-1, 1, 0]])("add(%d, %d) = %d", (a, b, c) => seen.push([a, b, c]));
  assert.deepEqual(tests.map((t) => t.name), ["add(1, 2) = 3", "add(0, 0) = 0", "add(-1, 1) = 0"]);
  assert.deepEqual(seen, [], "run עוד לא נקרא");
  for (const t of tests) t.run();
  assert.deepEqual(seen, [[1, 2, 3], [0, 0, 0], [-1, 1, 0]], "fn מקבלת את איברי השורה כארגומנטים נפרדים");
});
test("%s, %%, שורה שאינה מערך", async () => {
  const each = await get();
  assert.deepEqual(each([["?page=0", "page"], ["?limit=99", "limit"]])("%s ← שגיאה ב־%s", () => {}).map((t) => t.name), ["?page=0 ← שגיאה ב־page", "?limit=99 ← שגיאה ב־limit"]);
  assert.deepEqual(each([[50, "הנחה"]])("%d%% %s", () => {}).map((t) => t.name), ["50% הנחה"], "%% לא צורך ארגומנט");
  const got = [];
  const tests = each(["a", "bb"])("אורך %s", (x) => got.push(x));
  assert.deepEqual(tests.map((t) => t.name), ["אורך a", "אורך bb"]);
  tests.forEach((t) => t.run());
  assert.deepEqual(got, ["a", "bb"]);
  assert.deepEqual(each([["7", true]])("%d — %s", () => {}).map((t) => t.name), ["7 — true"], "%d ← String(Number(x))");
  assert.deepEqual(each([[1.5]])("%d", () => {}).map((t) => t.name), ["1.5"]);
});
test("run מחזיר את מה ש־fn זורקת", async () => {
  const each = await get();
  const [t1] = each([[1]])("x %d", () => { throw new Error("נכשל"); });
  assert.throws(() => t1.run(), { message: "נכשל" });
  assert.deepEqual(each([])("x", () => {}), []);
});
