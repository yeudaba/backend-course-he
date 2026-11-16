import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { ClickBuffer } = await load(import.meta.url, "P28-E64.ts");

test("סופר, ממיין ומאפס", () => {
  const b = new ClickBuffer();
  for (const c of ["abc", "xyz", "abc", "q", "abc", "xyz", "b2"]) b.click(c);
  assert.equal(b.pending(), 7);
  assert.deepEqual(b.flush(), [["abc", 3], ["xyz", 2], ["b2", 1], ["q", 1]]);
  assert.equal(b.pending(), 0);
  assert.deepEqual(b.flush(), []);
  b.click("new");
  assert.deepEqual(b.flush(), [["new", 1]]);
});
test("סף — true כשמגיעים ל־maxPending", () => {
  const b = new ClickBuffer(3);
  assert.equal(b.click("a"), false);
  assert.equal(b.click("b"), false);
  assert.equal(b.click("a"), true);
  assert.equal(b.click("c"), true);
  b.flush();
  assert.equal(b.click("a"), false);
});
test("ברירת מחדל 10,000", () => {
  const b = new ClickBuffer();
  let r = false;
  for (let i = 0; i < 9999; i++) r = b.click(`c${i % 7}`);
  assert.equal(r, false);
  assert.equal(b.click("x"), true);
});
test("flush מחזיר עותק", () => {
  const b = new ClickBuffer();
  b.click("a");
  const first = b.flush();
  b.click("a");
  assert.deepEqual(first, [["a", 1]]);
});
