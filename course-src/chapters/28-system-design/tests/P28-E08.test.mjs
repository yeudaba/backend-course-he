import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { roundRobin, leastConnections } = await load(import.meta.url, "P28-E08.ts");

test("round robin — בתורות, מתחיל מהראשון", () => {
  const next = roundRobin(["a", "b", "c"]);
  assert.deepEqual(Array.from({ length: 7 }, next), ["a", "b", "c", "a", "b", "c", "a"]);
  assert.throws(() => roundRobin([]));
});
test("least connections — למי שהכי פנוי; בתיקו — הראשון", () => {
  const lb = leastConnections(["a", "b", "c"]);
  assert.deepEqual([lb.acquire(), lb.acquire(), lb.acquire()], ["a", "b", "c"]);
  lb.release("b");
  assert.equal(lb.acquire(), "b", "b התפנה");
  lb.release("a");
  lb.release("a");
  assert.equal(lb.active("a"), 0, "release לא יורד מתחת ל־0");
  assert.equal(lb.acquire(), "a");
  assert.throws(() => lb.release("zzz"));
});
