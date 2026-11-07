// P22-E19 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { AuthError, createLogin, type Logger } from "./P22-E19.ts";

const PASSWORD = "dana-password-1";
function setup() {
  const log = { info: mock.fn<Logger["info"]>(), warn: mock.fn<Logger["warn"]>() };
  const login = createLogin([{ id: 1, email: "dana@example.com", password: PASSWORD }], log);
  // כל מה שנכתב ללוג, בכל הרמות
  const written = () => [...log.info.mock.calls, ...log.warn.mock.calls].map((c) => String(c.arguments[0]));
  return { log, login, written };
}

test("הצלחה, עם אימייל לא מנורמל", async () => {
  const { login, log } = setup();
  assert.deepEqual(await login("  Dana@Example.COM ", PASSWORD), { userId: 1 });
  assert.equal(log.info.mock.callCount(), 1);
});

test("אותה שגיאה בדיוק לאימייל לא רשום ולסיסמה שגויה", async () => {
  const { login } = setup();
  const wrong = await login("dana@example.com", "nope").catch((e) => e);
  const unknown = await login("ghost@example.com", "nope").catch((e) => e);
  assert.ok(wrong instanceof AuthError);
  assert.ok(unknown instanceof AuthError);
  assert.equal(unknown.message, wrong.message);
});

test("כישלון נכתב ללוג", async () => {
  const { login, log } = setup();
  await login("dana@example.com", "nope").catch(() => {});
  assert.equal(log.warn.mock.callCount(), 1);
});

test("סיסמה לא מגיעה ללוג — לא בהצלחה ולא בכישלון", async () => {
  const { login, written } = setup();
  await login("dana@example.com", PASSWORD);
  await login("dana@example.com", "secret-typo-123").catch(() => {});
  for (const line of written()) {
    assert.ok(!line.includes(PASSWORD) && !line.includes("secret-typo-123"), `סיסמה בלוג: ${line}`);
  }
});
