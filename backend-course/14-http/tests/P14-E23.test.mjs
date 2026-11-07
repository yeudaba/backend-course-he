import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseSearch } = await load(import.meta.url, "P14-E23.mjs");

test("בלי query", () => assert.deepEqual(parseSearch("/products"), { q: "", page: 1, nextPage: 2 }));
test("עברית מקודדת ו־+", () => {
  assert.equal(parseSearch("/products?q=%D7%9E%D7%A1%D7%9A").q, "מסך");
  assert.equal(parseSearch("/products?q=red+shoes").q, "red shoes");
});
test("page מספר", () => assert.deepEqual(parseSearch("/products?page=2&q=a"), { q: "a", page: 2, nextPage: 3 }));
