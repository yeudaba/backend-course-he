import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P14-E57.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["SessionStore"])).SessionStore;
const bearer = (t) => ({ authorization: `Bearer ${t}` });

test("login ו־userFor", async () => {
  const SessionStore = await get();
  const s = new SessionStore();
  const a = s.login("דנה");
  const b = s.login("יוסי");
  assert.equal(typeof a, "string");
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, "הטוקן נוצר עם crypto.randomUUID()");
  assert.notEqual(a, b, "כל login נותן טוקן חדש");
  assert.equal(s.userFor(bearer(a)), "דנה");
  assert.equal(s.userFor(bearer(b)), "יוסי");
  assert.equal(s.size, 2);
  const obj = { id: 7 };
  assert.equal(s.userFor(bearer(s.login(obj))), obj, "המשתמש יכול להיות גם אובייקט");
});
test("header חסר או לא בפורמט ← null", async () => {
  const SessionStore = await get();
  const s = new SessionStore();
  const t = s.login("דנה");
  assert.equal(s.userFor({}), null, "בלי authorization");
  assert.equal(s.userFor({ authorization: t }), null, "בלי Bearer");
  assert.equal(s.userFor({ authorization: `Basic ${t}` }), null);
  assert.equal(s.userFor({ authorization: `bearer ${t}` }), null, "בדיוק Bearer");
  assert.equal(s.userFor({ authorization: "Bearer" }), null);
  assert.equal(s.userFor({ authorization: `Bearer ${t} extra` }), null);
  assert.equal(s.userFor({ Authorization: `Bearer ${t}` }), null, "ב־Node השם באותיות קטנות — Authorization לא נקרא");
  assert.equal(s.userFor(bearer("no-such-token")), null);
});
test("logout ו־size", async () => {
  const SessionStore = await get();
  const s = new SessionStore();
  const t = s.login("דנה");
  assert.equal(s.logout(t), true);
  assert.equal(s.logout(t), false, "פעם שנייה — כבר לא קיים");
  assert.equal(s.logout("nope"), false);
  assert.equal(s.size, 0);
  assert.equal(s.userFor(bearer(t)), null);
});
test("כל מופע נפרד, ה־Map פרטית", async () => {
  const SessionStore = await get();
  const a = new SessionStore();
  const b = new SessionStore();
  const t = a.login("דנה");
  assert.equal(b.userFor(bearer(t)), null, "מופע שני לא מכיר טוקנים של הראשון");
  assert.equal(b.size, 0);
  assert.deepEqual(Object.keys(a), [], "אין שדות ציבוריים — ה־Map בשדה פרטי (#)");
  assert.match(code(import.meta.url, FILE), /#\w+\s*=\s*new Map/, "שמור את הטוקנים ב־Map בשדה פרטי (#)");
});
