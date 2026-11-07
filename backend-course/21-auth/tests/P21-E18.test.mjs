import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { LoginService, safeEqual } = loadNest(import.meta.url, "P21-E18.ts");

function fakeHasher() {
  const calls = { hash: 0, compare: 0 };
  return {
    calls,
    async hash(p) { calls.hash++; return "H:" + p; },
    async compare(p, h) { calls.compare++; return h === "H:" + p; },
  };
}

test("compare רץ פעם אחת בכל מקרה", async () => {
  const hasher = fakeHasher();
  const s = new LoginService(hasher);
  await s.addUser("dana@example.com", "dana-password-1");
  for (const [email, password, ok] of [["dana@example.com", "dana-password-1", true], ["dana@example.com", "wrong", false], ["ghost@example.com", "wrong", false]]) {
    const before = hasher.calls.compare;
    let err;
    try { await s.login(email, password); } catch (e) { err = e; }
    assert.equal(hasher.calls.compare - before, 1, `${email}: בדיוק compare אחד`);
    assert.equal(!err, ok, email);
    if (err) assert.equal(err.message, "אימייל או סיסמה שגויים");
  }
  assert.deepEqual(await s.login("dana@example.com", "dana-password-1"), { userId: 1 });
});
test("safeEqual", () => {
  assert.equal(safeEqual("secret-key", "secret-key"), true);
  assert.equal(safeEqual("secret-key", "secret-kez"), false);
  assert.equal(safeEqual("short", "much-longer-value"), false, "אורכים שונים — false, לא חריגה");
  assert.equal(safeEqual("", ""), true);
});
