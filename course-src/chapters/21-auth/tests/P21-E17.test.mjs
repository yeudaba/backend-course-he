import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { AccountService } = loadNest(import.meta.url, "P21-E17.ts");
const status = (code, message) => (e) => e.getStatus?.() === code && (!message || e.message === message);

test("יציאה", async () => {
  const s = new AccountService(4);
  await s.createUser("dana@example.com", "old-password-1");
  const a = await s.login("dana@example.com", "old-password-1");
  const b = await s.login("dana@example.com", "old-password-1");
  s.logout(a);
  assert.equal(s.isActive(a), false);
  assert.equal(s.isActive(b), true, "רק המכשיר הזה");
  assert.doesNotThrow(() => s.logout("unknown"));
});
test("החלפת סיסמה", async () => {
  const s = new AccountService(4);
  const dana = await s.createUser("dana@example.com", "old-password-1");
  await s.createUser("yossi@example.com", "yossi-password-1");
  const t1 = await s.login("dana@example.com", "old-password-1");
  const t2 = await s.login("dana@example.com", "old-password-1");
  const ty = await s.login("yossi@example.com", "yossi-password-1");
  await assert.rejects(s.changePassword(dana, "wrong-password", "new-password-1"), status(401, "הסיסמה הנוכחית שגויה"));
  await assert.rejects(s.changePassword(dana, "old-password-1", "short"), status(400, "לפחות 8 תווים"));
  await assert.rejects(s.changePassword(dana, "old-password-1", "old-password-1"), status(400, "הסיסמה החדשה זהה לישנה"));
  assert.equal(s.isActive(t1), true, "ניסיונות כושלים לא ביטלו כלום");
  await s.changePassword(dana, "old-password-1", "new-password-1");
  assert.equal(s.isActive(t1) || s.isActive(t2), false, "כל הטוקנים של דנה בוטלו");
  assert.equal(s.isActive(ty), true, "של יוסי — לא");
  await assert.rejects(s.login("dana@example.com", "old-password-1"), status(401));
  assert.equal(s.isActive(await s.login("dana@example.com", "new-password-1")), true);
});
