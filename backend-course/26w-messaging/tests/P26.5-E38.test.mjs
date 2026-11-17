import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { outOfOrderKeys } = await load(import.meta.url, "P26.5-E38.ts");
const d = (s) => s.split(" ").map((x) => { const [key, seq] = x.split(":"); return { key, seq: Number(seq) }; });

test("סדר, היפוך וכפילות", () => {
  assert.deepEqual(outOfOrderKeys(d("a:1 b:1 a:2 b:2 a:3")), []);
  assert.deepEqual(outOfOrderKeys(d("a:1 a:3 a:2 a:4 b:1 b:2")), ["a"], "3 ואז 2 — גם אם אחר כך 4");
  assert.deepEqual(outOfOrderKeys(d("z:1 z:1 c:2 c:1 a:5")), ["c", "z"], "כפילות נחשבת");
  assert.deepEqual(outOfOrderKeys([]), []);
});
