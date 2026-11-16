import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { keysetQuery } = await load(import.meta.url, "P28-E80.ts");
const norm = (s) => s.replace(/\s+/g, " ").trim();

test("עמוד ראשון", () => {
  const q = keysetQuery("posts", { limit: 20 });
  assert.equal(norm(q.text), "SELECT * FROM posts ORDER BY created_at DESC, id DESC LIMIT $1");
  assert.deepEqual(q.values, [20]);
});
test("עמוד הבא", () => {
  const q = keysetQuery("orders", { limit: 5, after: { createdAt: "2026-01-06T18:53:20Z", id: 500000 } });
  assert.equal(norm(q.text), "SELECT * FROM orders WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT $3");
  assert.deepEqual(q.values, ["2026-01-06T18:53:20Z", 500000, 5]);
});
test("שם טבלה ו־limit", () => {
  for (const bad of ["posts; DROP TABLE users", "Posts", "1posts", "", "posts--"]) assert.throws(() => keysetQuery(bad, { limit: 10 }), Error, bad);
  assert.equal(norm(keysetQuery("user_events_2", { limit: 100 }).text).startsWith("SELECT * FROM user_events_2 "), true);
  for (const bad of [0, 101, 2.5, -1]) assert.throws(() => keysetQuery("posts", { limit: bad }), RangeError, String(bad));
});
