import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { LRUCache } = await load(import.meta.url, "P27-E16.ts");

test("שומר עד capacity; מוציא את מי שהכי מזמן לא השתמשו בו", () => {
  const c = new LRUCache(2);
  c.set("a", 1);
  c.set("b", 2);
  assert.equal(c.get("a"), 1, "get של a ← a הופך ל'אחרון בשימוש'");
  c.set("c", 3);
  assert.equal(c.get("b"), undefined, "b הוצא — הוא הכי מזמן");
  assert.equal(c.get("a"), 1);
  assert.equal(c.get("c"), 3);
  assert.equal(c.size, 2);
});
test("set לקיים — מעדכן ומרענן, בלי להוציא אף אחד", () => {
  const c = new LRUCache(2);
  c.set("a", 1);
  c.set("b", 2);
  c.set("a", 10);
  c.set("c", 3);
  assert.deepEqual(c.keys(), ["a", "c"], "keys() — מהישן לחדש; b הוצא");
  assert.equal(c.get("a"), 10);
});
test("ערכים falsy נשמרים; get של חסר לא מוסיף", () => {
  const c = new LRUCache(3);
  c.set("zero", 0);
  c.set("empty", "");
  assert.equal(c.get("zero"), 0);
  assert.equal(c.get("empty"), "");
  assert.equal(c.get("nope"), undefined);
  assert.equal(c.size, 2);
});
test("capacity לא תקין ← שגיאה", () => {
  assert.throws(() => new LRUCache(0));
  assert.throws(() => new LRUCache(-1));
});
test("300,000 פעולות — מהר (כל פעולה O(1))", () => {
  fastEnough(() => {
    const c = new LRUCache(10_000);
    for (let i = 0; i < 150_000; i++) {
      c.set(`k${i}`, i);
      c.get(`k${i >> 1}`);
    }
    assert.equal(c.size, 10_000);
  }, 1500, "LRUCache עם 10,000 מקומות ו־300,000 פעולות");
});
