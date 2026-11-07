import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { RefreshTokenService } = loadNest(import.meta.url, "P21-E23.ts");

test("לא שומרים את הטוקן עצמו", () => {
  const s = new RefreshTokenService({ now: () => new Date("2026-11-04T10:00:00Z") });
  const token = s.issue(1);
  assert.ok(!s.storedKeys().includes(token));
  assert.equal(s.storedKeys()[0].length, 64, "SHA-256 ב־hex");
});
test("rotation: הישן לא עובד שוב", () => {
  const s = new RefreshTokenService({ now: () => new Date("2026-11-04T10:00:00Z") });
  const t1 = s.issue(1);
  s.rotate(t1);
  assert.throws(() => s.rotate(t1), (e) => e.getStatus?.() === 401);
});
test("תוקף של 7 ימים — לא 10 דקות", () => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const s = new RefreshTokenService({ now: () => clock.now });
  const t1 = s.issue(1);
  clock.now = new Date("2026-11-05T10:00:00Z");
  const { refreshToken } = s.rotate(t1);
  clock.now = new Date("2026-11-12T09:59:00Z");
  assert.equal(s.rotate(refreshToken).userId, 1, "6 ימים ו־23 שעות אחרי");
});
