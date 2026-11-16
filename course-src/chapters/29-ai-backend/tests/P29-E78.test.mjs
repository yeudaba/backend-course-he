import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cacheReport } = await load(import.meta.url, "P29-E78.ts");
const u = (input_tokens, w, r) => ({ input_tokens, output_tokens: 50, cache_creation_input_tokens: w, cache_read_input_tokens: r });

test("עובד", () => {
  assert.deepEqual(cacheReport([u(40, 5000, 0), u(35, 0, 5000), u(60, 0, 5000), u(20, 0, 5000)]), { calls: 4, writes: 1, reads: 3, cachedShare: 0.74, verdict: "working" });
});
test("כותבים בכל קריאה ולא קוראים אף פעם", () => {
  assert.deepEqual(cacheReport([u(40, 5000, 0), u(35, 5000, 0), u(60, 5000, null)]), { calls: 3, writes: 3, reads: 0, cachedShare: 0, verdict: "never_read" });
});
test("בלי cache, קריאה ראשונה, ריק", () => {
  assert.deepEqual(cacheReport([{ input_tokens: 5000, output_tokens: 10 }, u(5000, null, null)]), { calls: 2, writes: 0, reads: 0, cachedShare: 0, verdict: "no_cache" });
  assert.deepEqual(cacheReport([u(40, 5000, 0)]), { calls: 1, writes: 1, reads: 0, cachedShare: 0, verdict: "warming_up" });
  assert.deepEqual(cacheReport([]), { calls: 0, writes: 0, reads: 0, cachedShare: 0, verdict: "no_cache" });
});
test("cachedShare: חלקי כל הקלט (רגיל + כתיבה + קריאה), עיגול ל־2 ספרות", () => {
  assert.equal(cacheReport([u(100, 0, 100)]).cachedShare, 0.5);
  assert.equal(cacheReport([u(1, 1, 1)]).cachedShare, 0.33);
  assert.equal(cacheReport([u(0, 0, 900), u(100, 0, 0)]).cachedShare, 0.9);
  assert.equal(cacheReport([u(0, 0, 0)]).cachedShare, 0);
});
