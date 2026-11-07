import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { AuthModule, CLOCK } = loadNest(import.meta.url, "P21-E19.ts");

test("נעילה אחרי 5 כישלונות", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const { call } = await nestApp(t, AuthModule, { overrides: [[CLOCK, { now: () => clock.now }]] });
  const login = (password, email = "dana@example.com") => call("POST", "/auth/login", { email, password });
  for (let i = 0; i < 5; i++) {
    clock.now = new Date(Date.UTC(2026, 10, 4, 10, i));
    assert.equal((await login("wrong")).status, 401, `ניסיון ${i + 1}`);
  }
  clock.now = new Date("2026-11-04T10:05:00Z");
  let res = await login("correct-password");
  assert.equal(res.status, 429, "נעול — גם עם סיסמה נכונה");
  assert.equal(res.headers.get("retry-after"), "600", "הכישלון הראשון ב־10:00 ← פתוח ב־10:15");
  assert.equal((await login("correct-password", "DANA@example.com")).status, 429, "אותו אימייל באותיות אחרות");
  assert.equal((await login("correct-password", "yossi@example.com")).status, 200, "אימייל אחר לא נעול");
  clock.now = new Date("2026-11-04T10:15:00Z");
  assert.equal((await login("correct-password")).status, 200, "אחרי 15 דקות");
});
test("הצלחה מאפסת", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const { call } = await nestApp(t, AuthModule, { overrides: [[CLOCK, { now: () => clock.now }]] });
  const login = (password) => call("POST", "/auth/login", { email: "dana@example.com", password });
  for (let i = 0; i < 4; i++) await login("wrong");
  assert.equal((await login("correct-password")).status, 200);
  for (let i = 0; i < 4; i++) assert.equal((await login("wrong")).status, 401, "המונה התאפס");
  assert.equal((await login("wrong")).status, 401, "החמישי עדיין 401");
  assert.equal((await login("wrong")).status, 429);
});
