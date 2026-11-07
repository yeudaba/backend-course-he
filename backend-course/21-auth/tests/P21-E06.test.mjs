import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { hashPassword, verifyPassword, needsRehash } = loadNest(import.meta.url, "P21-E06.ts");

test("hash ו־verify", async () => {
  const a = await hashPassword("correct horse", 4);
  const b = await hashPassword("correct horse", 4);
  assert.match(a, /^\$2[aby]\$04\$.{53}$/, "מחרוזת bcrypt עם cost 4");
  assert.notEqual(a, b, "salt שונה בכל פעם");
  assert.equal(await verifyPassword("correct horse", a), true);
  assert.equal(await verifyPassword("correct horse", b), true);
  assert.equal(await verifyPassword("Correct horse", a), false);
  assert.ok(!a.includes("correct horse"), "הסיסמה לא בתוך ה־hash");
});
test("ברירת המחדל: cost 12", async () => {
  assert.match(await hashPassword("x"), /^\$2[aby]\$12\$/);
});
test("סיסמה ריקה", async () => {
  await assert.rejects(hashPassword("", 4), { message: "סיסמה ריקה" });
});
test("needsRehash", async () => {
  const old = await hashPassword("x", 4);
  assert.equal(needsRehash(old, 10), true);
  assert.equal(needsRehash(old, 4), false);
  assert.equal(needsRehash(await hashPassword("x", 5), 4), false, "cost גבוה יותר — לא צריך");
});
