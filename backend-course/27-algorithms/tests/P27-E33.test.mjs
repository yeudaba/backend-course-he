import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { dedupeByEmail } = await load(import.meta.url, "P27-E33.ts");

test("הראשון לכל email מנורמל, בסדר, בלי לשנות", () => {
  const users = [{ id: 1, email: "Dana@x.com" }, { id: 2, email: "yossi@x.com" }, { id: 3, email: " dana@X.com " }, { id: 4, email: "noa@x.com" }, { id: 5, email: "YOSSI@x.com" }];
  const before = structuredClone(users);
  assert.deepEqual(dedupeByEmail(users).map((u) => u.id), [1, 2, 4]);
  assert.deepEqual(users, before);
  assert.equal(dedupeByEmail(users)[0], users[0], "אותם אובייקטים");
  assert.deepEqual(dedupeByEmail([]), []);
});
test("200,000 — מהר", () => {
  const users = Array.from({ length: 200_000 }, (_, i) => ({ id: i, email: `U${i % 150_000}@x.com` }));
  const r = fastEnough(() => dedupeByEmail(users), 300, "dedupeByEmail על 200,000");
  assert.equal(r.length, 150_000);
});
