import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { wordFrequencies, topWords } = await load(import.meta.url, "P07-E18.js");

const text = "Node is fast. Node is fun! JS is everywhere, is it?";
test("wordFrequencies מחזירה Map", () => {
  const m = wordFrequencies(text);
  assert.ok(m instanceof Map);
  assert.equal(m.get("is"), 4);
  assert.equal(m.get("node"), 2);
  assert.equal(m.get("fast"), 1);
  assert.equal(m.has("fast."), false);
});
test("topWords", () => assert.deepEqual(topWords(text, 3), [["is", 4], ["node", 2], ["everywhere", 1]]));
test("טקסט ריק", () => assert.deepEqual(topWords("", 3), []));
