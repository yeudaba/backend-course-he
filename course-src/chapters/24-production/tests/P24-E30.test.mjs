import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { renderHistogram } = await load(import.meta.url, "P24-E30.ts");

test("דליים מצטברים", () => {
  const lines = renderHistogram({ name: "d", labels: { route: "/a" }, buckets: [1, 0.1], values: [0.05, 0.5, 0.7] });
  assert.equal(lines[0], 'd_bucket{route="/a",le="0.1"} 1');
  assert.equal(lines[1], 'd_bucket{route="/a",le="1"} 3', "le=\"1\" סופר גם את מה שב־le=\"0.1\"");
});
test("+Inf קיים ושווה ל־count", () => {
  const lines = renderHistogram({ name: "d", labels: { route: "/a" }, buckets: [0.1], values: [0.05, 9] });
  assert.deepEqual(lines, ['d_bucket{route="/a",le="0.1"} 1', 'd_bucket{route="/a",le="+Inf"} 2', 'd_sum{route="/a"} 9.05', 'd_count{route="/a"} 2']);
});
test("escaping של ערכים", () => {
  const lines = renderHistogram({ name: "d", labels: { q: 'say "hi"\\' }, buckets: [1], values: [] });
  assert.equal(lines[0], 'd_bucket{q="say \\"hi\\"\\\\",le="1"} 0');
});
