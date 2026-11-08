import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBalancer } = await load(import.meta.url, "P28-E09.ts");

test("שרת שנכשל failThreshold פעמים ברצף — יוצא מהסבב", () => {
  let t = 0;
  const lb = createBalancer(["a", "b", "c"], { failThreshold: 2, recoverAfterMs: 1000, now: () => t });
  lb.report("b", false);
  lb.report("b", true);
  lb.report("b", false);
  assert.deepEqual(lb.healthy(), ["a", "b", "c"], "הצלחה באמצע מאפסת את הרצף");
  lb.report("b", false);
  assert.deepEqual(lb.healthy(), ["a", "c"]);
  assert.deepEqual(Array.from({ length: 4 }, () => lb.pick()), ["a", "c", "a", "c"]);
});
test("אחרי recoverAfterMs — חוזר; כישלון אחד נוסף מוריד שוב", () => {
  let t = 0;
  const lb = createBalancer(["a", "b"], { failThreshold: 3, recoverAfterMs: 1000, now: () => t });
  for (let i = 0; i < 3; i++) lb.report("a", false);
  assert.deepEqual([lb.pick(), lb.pick()], ["b", "b"]);
  t = 1000;
  assert.ok([lb.pick(), lb.pick()].includes("a"), "אחרי שנייה a מקבל הזדמנות");
  lb.report("a", false);
  assert.deepEqual([lb.pick(), lb.pick()], ["b", "b"], "נכשל שוב ← למטה מיד");
});
test("כולם למטה ← null", () => {
  const lb = createBalancer(["a"], { failThreshold: 1, now: () => 0 });
  lb.report("a", false);
  assert.equal(lb.pick(), null);
});
