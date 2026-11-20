import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest } from "../../tools/nest.mjs";

const { register, login } = loadNest(import.meta.url, "P21-E101.ts");
const BAD = { message: "אימייל או סיסמה שגויים" };

test("register: מנרמל, שומר hash, ומחזיר רק email", async () => {
  const users = new Map();
  assert.deepEqual(await register(users, "  Dana@X.com ", "secret123", 4), { email: "dana@x.com" }, "התשובה של ההרשמה — רק { email }, בלי passwordHash");
  const stored = users.get("dana@x.com");
  assert.ok(stored, "המשתמש צריך להישמר לפי האימייל המנורמל");
  assert.match(stored.passwordHash, /^\$2[aby]\$04\$.{53}$/);
  assert.equal(users.size, 1);
  await assert.rejects(register(users, "dana@x.com", "other", 4), { message: "האימייל כבר רשום" });
});
test("login: סיסמה נכונה, גם באותיות אחרות באימייל", async () => {
  const users = new Map();
  await register(users, "Dana@X.com", "secret123", 4);
  assert.deepEqual(await login(users, "DANA@x.com ", "secret123"), { email: "dana@x.com" });
});
test("login: סיסמה שגויה נדחית", async () => {
  const users = new Map();
  await register(users, "a@x.com", "secret123", 4);
  await assert.rejects(login(users, "a@x.com", "wrong-password"), BAD, "סיסמה שגויה נכנסה — compare מחזירה Promise");
  await assert.rejects(login(users, "a@x.com", "Secret123"), BAD);
});
test("login: אותה שגיאה לאימייל שלא קיים", async () => {
  await assert.rejects(login(new Map(), "nobody@x.com", "secret123"), BAD, "הודעה שונה לאימייל שלא קיים מגלה אילו אימיילים רשומים");
});
