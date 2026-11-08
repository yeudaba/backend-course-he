import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createDbRouter } = await load(import.meta.url, "P28-E14.ts");

test("כתיבה ל־primary; קריאות — replicas בתורות", () => {
  const db = createDbRouter({ primary: "p", replicas: ["r1", "r2"], now: () => 0 });
  assert.equal(db.forWrite("dana"), "p");
  assert.deepEqual([db.forRead("yossi"), db.forRead("yossi"), db.forRead("noa")], ["r1", "r2", "r1"]);
});
test("קריאה אחרי כתיבה — מה־primary, עד stickyMs", () => {
  let t = 1000;
  const db = createDbRouter({ primary: "p", replicas: ["r1"], stickyMs: 2000, now: () => t });
  db.forWrite("dana");
  assert.equal(db.forRead("dana"), "p");
  assert.equal(db.forRead("yossi"), "r1", "רק מי שכתב");
  t = 2999;
  assert.equal(db.forRead("dana"), "p");
  t = 3000;
  assert.equal(db.forRead("dana"), "r1");
});
test("בלי replicas — הכול ל־primary", () => {
  const db = createDbRouter({ primary: "p", replicas: [] });
  assert.equal(db.forRead("x"), "p");
});
