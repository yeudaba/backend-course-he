import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { clicksUpdate } = await load(import.meta.url, "P28-E70.ts");
const norm = (s) => s.replace(/\s+/g, " ").trim();

test("שני קודים", () => {
  const q = clicksUpdate([["abc", 5], ["xyz", 2]]);
  assert.equal(norm(q.text), "UPDATE links SET clicks = links.clicks + v.n FROM (VALUES ($1, $2::bigint), ($3, $4::bigint)) AS v(code, n) WHERE links.code = v.code");
  assert.deepEqual(q.values, ["abc", 5, "xyz", 2]);
});
test("איחוד כפולים, ופרמטרים בלבד", () => {
  const evil = "x'); DROP TABLE links; --";
  const q = clicksUpdate([["a", 1], [evil, 3], ["a", 4], ["b", 1]]);
  assert.equal(norm(q.text), "UPDATE links SET clicks = links.clicks + v.n FROM (VALUES ($1, $2::bigint), ($3, $4::bigint), ($5, $6::bigint)) AS v(code, n) WHERE links.code = v.code");
  assert.deepEqual(q.values, ["a", 5, evil, 3, "b", 1]);
  assert.ok(!q.text.includes("DROP"), "קוד לא נכנס לטקסט");
  assert.equal(clicksUpdate([["only", 7]]).values.length, 2);
});
test("ריק ושגיאות", () => {
  assert.equal(clicksUpdate([]), null);
  assert.throws(() => clicksUpdate([["a", 0]]), RangeError);
  assert.throws(() => clicksUpdate([["a", 1.5]]), RangeError);
  assert.throws(() => clicksUpdate([["a", -2]]), RangeError);
});
