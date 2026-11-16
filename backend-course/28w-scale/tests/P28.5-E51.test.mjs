import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { jsonArrayChunks } = await load(import.meta.url, "P28.5-E51.ts");

test("החיבור = JSON.stringify", () => {
  const items = Array.from({ length: 1234 }, (_, i) => ({ id: i, name: `שם ${i}`, tags: ["a", "b"], price: i / 3 }));
  const chunks = [...jsonArrayChunks(items, 500)];
  assert.equal(chunks.length, 3);
  assert.equal(chunks.join(""), JSON.stringify(items));
  assert.ok(chunks[0].startsWith("[") && chunks.at(-1).endsWith("]"));
  assert.equal([...jsonArrayChunks(items)].length, 3, "ברירת מחדל 500");
  assert.deepEqual(JSON.parse([...jsonArrayChunks(items, 7)].join("")), items);
});
test("קצוות", () => {
  assert.deepEqual([...jsonArrayChunks([])], ["[]"]);
  assert.deepEqual([...jsonArrayChunks([1], 10)], ["[1]"]);
  assert.deepEqual([...jsonArrayChunks([1, 2, 3, 4], 2)], ["[1,2", ",3,4]"]);
  assert.equal([...jsonArrayChunks([null, "x", undefined, 5], 3)].join(""), JSON.stringify([null, "x", undefined, 5]));
});
test("generator עצל", () => {
  const g = jsonArrayChunks(Array.from({ length: 100 }, (_, i) => i), 10);
  assert.equal(typeof g.next, "function");
  assert.equal(g.next().value, "[0,1,2,3,4,5,6,7,8,9");
});
