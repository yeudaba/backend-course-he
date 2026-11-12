import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E95.ts", ["loadProductionConfig"])).loadProductionConfig;

test("ברירות מחדל, ומשתנים אחרים — מתעלמים", async () => {
  const load = await get();
  assert.deepEqual(load({}), { logLevel: "info", authRateLimitPerMinute: 10, idempotencyTtlHours: 24, trustProxy: 0 });
  assert.deepEqual(load({ HOME: "/root", JWT_SECRET: "x" }), { logLevel: "info", authRateLimitPerMinute: 10, idempotencyTtlHours: 24, trustProxy: 0 });
});
test("ערכים מה־env (מחרוזות)", async () => {
  const load = await get();
  assert.deepEqual(load({ LOG_LEVEL: "debug", AUTH_RATE_LIMIT_PER_MINUTE: "5", IDEMPOTENCY_TTL_HOURS: "48", TRUST_PROXY: "2" }), { logLevel: "debug", authRateLimitPerMinute: 5, idempotencyTtlHours: 48, trustProxy: 2 });
  assert.equal(load({ TRUST_PROXY: "0" }).trustProxy, 0);
});
test("לא תקין ← כל הבעיות בהודעה אחת", async () => {
  const load = await get();
  let err;
  try { load({ LOG_LEVEL: "verbose", AUTH_RATE_LIMIT_PER_MINUTE: "0", TRUST_PROXY: "-1" }); } catch (e) { err = e; }
  assert.ok(err instanceof Error, "זורק Error");
  assert.ok(err.message.startsWith("הגדרות לא תקינות: "), err.message);
  const parts = err.message.slice("הגדרות לא תקינות: ".length).split("; ");
  assert.equal(parts.length, 3, "שלוש בעיות");
  assert.deepEqual(parts.map((p) => p.split(":")[0]).sort(), ["AUTH_RATE_LIMIT_PER_MINUTE", "LOG_LEVEL", "TRUST_PROXY"]);
  for (const env of [{ IDEMPOTENCY_TTL_HOURS: "1.5" }, { TRUST_PROXY: "abc" }, { AUTH_RATE_LIMIT_PER_MINUTE: "ten" }, { LOG_LEVEL: "INFO" }]) {
    assert.throws(() => load(env), /^Error: הגדרות לא תקינות: /, JSON.stringify(env));
  }
});
