import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { readWriteRatio } = await load(import.meta.url, "P28-E39.ts");

test("סופר ומחשב יחס", () => {
  const methods = [...Array(300).fill("GET"), ...Array(20).fill("head"), ...Array(50).fill("OPTIONS"), "POST", "put", "DELETE", "PATCH"];
  assert.deepEqual(readWriteRatio(methods), { reads: 320, writes: 4, ratio: 80 });
  assert.deepEqual(readWriteRatio(["get", "get", "post", "post", "post"]), { reads: 2, writes: 3, ratio: 0.7 });
});
test("בלי כתיבות", () => {
  assert.deepEqual(readWriteRatio(["GET"]), { reads: 1, writes: 0, ratio: Infinity });
  assert.deepEqual(readWriteRatio([]), { reads: 0, writes: 0, ratio: 0 });
  assert.deepEqual(readWriteRatio(["OPTIONS"]), { reads: 0, writes: 0, ratio: 0 });
  assert.deepEqual(readWriteRatio(["POST"]), { reads: 0, writes: 1, ratio: 0 });
});
