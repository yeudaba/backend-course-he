import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadRedisConfig } = await load(import.meta.url, "P26-E104.ts");

test("ברירות מחדל, ובלי REDIS_URL אין redis", () => {
  assert.deepEqual(loadRedisConfig({}), { productsCacheTtlSeconds: 60, orderPaymentTimeoutSeconds: 1800, runWorker: true });
});
test("ערכים מה־env", () => {
  assert.deepEqual(
    loadRedisConfig({ REDIS_URL: "redis://redis:6379", PRODUCTS_CACHE_TTL_SECONDS: "30", ORDER_PAYMENT_TIMEOUT_SECONDS: "2", WORKER: "false", OTHER: "x" }),
    { redis: { url: "redis://redis:6379", prefix: "shop" }, productsCacheTtlSeconds: 30, orderPaymentTimeoutSeconds: 2, runWorker: false },
  );
  assert.deepEqual(loadRedisConfig({ REDIS_URL: "rediss://user:pw@cache.example.com:6380", REDIS_PREFIX: "shop-staging" }).redis, { url: "rediss://user:pw@cache.example.com:6380", prefix: "shop-staging" });
});
test("לא תקין ← הודעה עם כל המשתנים הבעייתיים", () => {
  assert.throws(() => loadRedisConfig({ WORKER: "yes" }), /^Error: הגדרות לא תקינות.*WORKER/s);
  let msg = "";
  try {
    loadRedisConfig({ REDIS_URL: "localhost:6379", REDIS_PREFIX: "shop:prod", PRODUCTS_CACHE_TTL_SECONDS: "0", ORDER_PAYMENT_TIMEOUT_SECONDS: "1.5", WORKER: "1" });
  } catch (e) {
    msg = e.message;
  }
  assert.match(msg, /^הגדרות לא תקינות/);
  for (const k of ["REDIS_URL", "REDIS_PREFIX", "PRODUCTS_CACHE_TTL_SECONDS", "ORDER_PAYMENT_TIMEOUT_SECONDS", "WORKER"]) assert.ok(msg.includes(k), `ההודעה לא מזכירה את ${k}: ${msg}`);
});
