import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { createHash } from "node:crypto";

const { RefreshTokenService } = loadNest(import.meta.url, "P21-E15.ts");
const unauthorized = (err) => err.getStatus?.() === 401 && err.message === "צריך להתחבר מחדש";

test("issue ו־rotate", () => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const service = new RefreshTokenService({ now: () => clock.now });
  const t1 = service.issue(7);
  assert.match(t1, /^[A-Za-z0-9_-]{43}$/, "32 בתים אקראיים ב־base64url");
  assert.notEqual(service.issue(7), t1);
  assert.ok(!service.storedKeys().includes(t1), "הטוקן עצמו לא נשמר");
  assert.ok(service.storedKeys().includes(createHash("sha256").update(t1).digest("hex")), "נשמר SHA-256 (hex)");

  const { userId, refreshToken: t2 } = service.rotate(t1);
  assert.equal(userId, 7);
  assert.notEqual(t2, t1);
  assert.throws(() => service.rotate(t1), unauthorized, "פעם אחת בלבד");
  assert.throws(() => service.rotate("made-up"), unauthorized);
  assert.equal(service.rotate(t2).userId, 7, "החדש עובד");
});
test("תוקף 7 ימים", () => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const service = new RefreshTokenService({ now: () => clock.now });
  const a = service.issue(1);
  const b = service.issue(1);
  clock.now = new Date("2026-11-11T09:59:59Z");
  assert.equal(service.rotate(a).userId, 1);
  clock.now = new Date("2026-11-11T10:00:00Z");
  assert.throws(() => service.rotate(b), unauthorized);
});
