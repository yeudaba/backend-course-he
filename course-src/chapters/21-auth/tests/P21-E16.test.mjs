import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { RefreshTokenService } = loadNest(import.meta.url, "P21-E16.ts");

test("שימוש חוזר מבטל רק את המשפחה", () => {
  const service = new RefreshTokenService({ now: () => new Date("2026-11-04T10:00:00Z") });
  const laptop1 = service.login(1);
  const phone = service.login(1);
  const other = service.login(2);
  const laptop2 = service.rotate(laptop1).refreshToken;
  assert.equal(service.activeCount(1), 2, "laptop2 ו־phone");

  assert.throws(() => service.rotate(laptop1), (e) => e.getStatus?.() === 401, "laptop1 כבר הוחלף");
  assert.throws(() => service.rotate(laptop2), (e) => e.getStatus?.() === 401, "כל המשפחה של ה־laptop בוטלה");
  assert.equal(service.activeCount(1), 1, "הטלפון עדיין מחובר");
  assert.equal(service.rotate(phone).userId, 1);
  assert.equal(service.rotate(other).userId, 2, "משתמש אחר לא הושפע");
});
test("תוקף", () => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const service = new RefreshTokenService({ now: () => clock.now });
  const t = service.login(1);
  clock.now = new Date("2026-11-11T10:00:00Z");
  assert.throws(() => service.rotate(t), (e) => e.getStatus?.() === 401);
});
