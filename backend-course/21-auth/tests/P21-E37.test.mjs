import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E37.ts", ["PasswordService"])).PasswordService;

// סופר קריאות ל־bcrypt.compare ול־bcrypt.hash (על אותו אובייקט שהקוד שלך מייבא)
function spy(t) {
  const calls = { compare: [], hash: [] };
  const { compare, hash } = bcrypt;
  bcrypt.compare = (...a) => (calls.compare.push(a), compare(...a));
  bcrypt.hash = (...a) => (calls.hash.push(a), hash(...a));
  t.after(() => Object.assign(bcrypt, { compare, hash }));
  return calls;
}

test("hash ו־verify עם ה־cost מה־constructor", async () => {
  const PasswordService = await get();
  const s = new PasswordService(5);
  const h = await s.hash("correct horse");
  assert.equal(bcrypt.getRounds(h), 5);
  assert.equal(await s.verify("correct horse", h), true);
  assert.equal(await s.verify("correct horsE", h), false);
  assert.equal(bcrypt.getRounds(await new PasswordService(4).hash("x")), 4);
});
test("verifyAgainstDummy — compare אמיתי, אותו cost, תמיד false", async (t) => {
  const PasswordService = await get();
  const calls = spy(t);
  const s = new PasswordService(6);
  assert.equal(await s.verifyAgainstDummy("whatever-password"), false);
  assert.equal(calls.compare.length, 1, "bcrypt.compare נקרא פעם אחת (import bcrypt from \"bcryptjs\" ו־bcrypt.compare)");
  const [pw, dummy] = calls.compare[0];
  assert.equal(pw, "whatever-password", "משווים את הסיסמה שהוקלדה");
  assert.match(dummy, /^\$2[aby]\$06\$.{53}$/, "ה־hash הדמה הוא bcrypt אמיתי עם אותו cost כמו ה־constructor (6)");
  // גם הסיסמה של הדמה עצמה לא "נכנסת"
  const realCompare = calls.compare;
  for (const guess of ["", "dummy", "password", "dummy-password"]) assert.equal(await s.verifyAgainstDummy(guess), false);
  assert.equal(realCompare.length, 5);
  assert.ok(realCompare.every((c) => c[1] === dummy), "אותו hash דמה בכל הקריאות");
});
test("ה־hash הדמה מחושב פעם אחת למופע — גם בקריאות במקביל", async (t) => {
  const PasswordService = await get();
  const calls = spy(t);
  const s = new PasswordService(4);
  await Promise.all([s.verifyAgainstDummy("a"), s.verifyAgainstDummy("b"), s.verifyAgainstDummy("c")]);
  await s.verifyAgainstDummy("d");
  assert.equal(calls.hash.length, 1, "bcrypt.hash נקרא פעם אחת בלבד (שמור את ה־Promise, לא רק את התוצאה)");
  const other = new PasswordService(5);
  await other.verifyAgainstDummy("e");
  assert.match(calls.compare.at(-1)[1], /^\$2[aby]\$05\$/, "לכל מופע — דמה עם ה־cost שלו");
});
