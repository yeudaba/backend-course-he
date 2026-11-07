import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toQueryString, parseQueryString } = await load(import.meta.url, "P07-E12.js");

test("toQueryString", () => {
  assert.equal(toQueryString({ page: 2, sort: "price" }), "page=2&sort=price");
  assert.equal(toQueryString({ q: null, page: 1, x: undefined }), "page=1");
  assert.equal(toQueryString({}), "");
});
test("parseQueryString", () => {
  assert.deepEqual(parseQueryString("page=2&sort=price"), { page: "2", sort: "price" });
  assert.deepEqual(parseQueryString("?a=1"), { a: "1" });
  assert.deepEqual(parseQueryString(""), {});
  assert.deepEqual(parseQueryString("?"), {});
});
