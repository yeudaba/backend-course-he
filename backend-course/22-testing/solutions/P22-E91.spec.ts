// P22-E91 — בדיקות ל־AuthService
import { test } from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "./P22-E91.ts";

const MIN = 60_000;
function setup() {
  const clock = { t: new Date("2026-11-04T10:00:00Z").getTime(), now() { return new Date(this.t); } };
  return { clock, auth: new AuthService(clock) };
}

test("register — מנורמל, ובלי hash בתשובה", async () => {
  const { auth } = setup();
  assert.deepEqual(await auth.register("  Dana@Example.com ", "password-1"), { id: 1, email: "dana@example.com", role: "user" });
  await assert.rejects(auth.register("DANA@example.com", "other-pass"), { status: 409, code: "EMAIL_TAKEN" });
});

test("login — אותה שגיאה לאימייל לא קיים ולסיסמה שגויה", async () => {
  const { auth } = setup();
  await auth.register("dana@example.com", "password-1");
  const errors: unknown[] = [];
  for (const [email, pw] of [["nobody@example.com", "password-1"], ["dana@example.com", "wrong-pass"]]) {
    await auth.login(email, pw).catch((e) => errors.push({ status: e.status, code: e.code, message: e.message }));
  }
  assert.equal(errors.length, 2);
  assert.deepEqual(errors[0], { status: 401, code: "INVALID_CREDENTIALS", message: "אימייל או סיסמה שגויים" });
  assert.deepEqual(errors[1], errors[0]);
  await auth.login("DANA@example.com", "password-1");
});

test("access token — 15 דקות בדיוק", async () => {
  const { clock, auth } = setup();
  await auth.register("dana@example.com", "password-1");
  const { accessToken } = await auth.login("dana@example.com", "password-1");
  assert.deepEqual(await auth.verifyAccessToken(accessToken), { id: 1, role: "user" });
  clock.t += 15 * MIN - 1000;
  assert.deepEqual(await auth.verifyAccessToken(accessToken), { id: 1, role: "user" });
  clock.t += 1000;
  await assert.rejects(auth.verifyAccessToken(accessToken), { status: 401, code: "INVALID_TOKEN" });
});

test("refresh — rotation", async () => {
  const { auth } = setup();
  await auth.register("dana@example.com", "password-1");
  const first = await auth.login("dana@example.com", "password-1");
  const second = await auth.refresh(first.refreshToken);
  assert.notEqual(second.refreshToken, first.refreshToken);
  assert.deepEqual(await auth.verifyAccessToken(second.accessToken), { id: 1, role: "user" });
  await assert.rejects(auth.refresh(first.refreshToken), { status: 401, code: "INVALID_REFRESH_TOKEN" });
});

test("שימוש חוזר מבטל הכול — גם את הטוקן החדש", async () => {
  const { auth } = setup();
  await auth.register("dana@example.com", "password-1");
  const first = await auth.login("dana@example.com", "password-1");
  const second = await auth.refresh(first.refreshToken);
  await assert.rejects(auth.refresh(first.refreshToken));
  await assert.rejects(auth.refresh(second.refreshToken), { status: 401 });
});

test("refresh token — 7 ימים", async () => {
  const { clock, auth } = setup();
  await auth.register("dana@example.com", "password-1");
  const a = await auth.login("dana@example.com", "password-1");
  const b = await auth.login("dana@example.com", "password-1");
  clock.t += 7 * 24 * 60 * MIN - 1000;
  await auth.refresh(a.refreshToken);
  clock.t += 1000;
  await assert.rejects(auth.refresh(b.refreshToken), { status: 401, code: "INVALID_REFRESH_TOKEN" });
});
