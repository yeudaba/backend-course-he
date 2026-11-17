import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E89.ts", ["loadConfig"])).loadConfig;
const SECRET = "x".repeat(32);

test("ברירות מחדל", async () => {
  const loadConfig = await get();
  assert.deepEqual(loadConfig({ JWT_SECRET: SECRET, PATH: "/usr/bin" }), { jwtSecret: SECRET, accessTtlSeconds: 900, refreshTtlDays: 7, bcryptRounds: 12 });
});
test("ערכים מחרוזות", async () => {
  const loadConfig = await get();
  assert.deepEqual(
    loadConfig({ JWT_SECRET: SECRET + "yz", ACCESS_TOKEN_TTL_SECONDS: "300", REFRESH_TOKEN_TTL_DAYS: "30", BCRYPT_ROUNDS: "4" }),
    { jwtSecret: SECRET + "yz", accessTtlSeconds: 300, refreshTtlDays: 30, bcryptRounds: 4 },
  );
  assert.equal(loadConfig({ JWT_SECRET: SECRET, ACCESS_TOKEN_TTL_SECONDS: "3600" }).accessTtlSeconds, 3600);
  assert.equal(loadConfig({ JWT_SECRET: SECRET, BCRYPT_ROUNDS: "15" }).bcryptRounds, 15);
});
test("שגיאות — שמות, לפי הסדר, בלי ערכים", async () => {
  const loadConfig = await get();
  assert.throws(() => loadConfig({}), { message: "הגדרות לא תקינות: JWT_SECRET" });
  assert.throws(() => loadConfig({ JWT_SECRET: "short-secret-123" }), (e) => {
    assert.equal(e.message, "הגדרות לא תקינות: JWT_SECRET");
    assert.ok(!e.message.includes("short-secret-123"), "הסוד לא מופיע בהודעה");
    return true;
  });
  assert.throws(() => loadConfig({ JWT_SECRET: SECRET, BCRYPT_ROUNDS: "20" }), { message: "הגדרות לא תקינות: BCRYPT_ROUNDS" });
  assert.throws(() => loadConfig({ JWT_SECRET: SECRET, ACCESS_TOKEN_TTL_SECONDS: "10" }), { message: "הגדרות לא תקינות: ACCESS_TOKEN_TTL_SECONDS" });
  assert.throws(() => loadConfig({ JWT_SECRET: SECRET, REFRESH_TOKEN_TTL_DAYS: "abc" }), { message: "הגדרות לא תקינות: REFRESH_TOKEN_TTL_DAYS" });
  assert.throws(() => loadConfig({ JWT_SECRET: SECRET, ACCESS_TOKEN_TTL_SECONDS: "1.5" }), { message: "הגדרות לא תקינות: ACCESS_TOKEN_TTL_SECONDS" });
  assert.throws(() => loadConfig({ BCRYPT_ROUNDS: "3", JWT_SECRET: "a", REFRESH_TOKEN_TTL_DAYS: "91" }), { message: "הגדרות לא תקינות: JWT_SECRET, REFRESH_TOKEN_TTL_DAYS, BCRYPT_ROUNDS" });
});
