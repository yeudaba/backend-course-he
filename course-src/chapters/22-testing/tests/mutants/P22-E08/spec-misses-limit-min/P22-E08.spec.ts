import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePagination } from "./P22-E08.ts";
test("defaults", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20, offset: 0 });
  assert.deepEqual(parsePagination({}, { defaultLimit: 5 }), { page: 1, limit: 5, offset: 0 });
});
test("offset", () => assert.deepEqual(parsePagination({ page: "3", limit: "10" }), { page: 3, limit: 10, offset: 20 }));
test("max ok", () => assert.equal(parsePagination({ limit: "50" }).limit, 50));
test("bad", () => { for (const q of [{ page: "0" }, { limit: "2.5" }]) assert.throws(() => parsePagination(q), RangeError); });
