import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E89.ts", ["parseSmokeEnv"])).parseSmokeEnv;

test("ברירות מחדל וניקוי", async () => {
  const f = await get();
  assert.deepEqual(f({ BASE_URL: "https://tasks-api.onrender.com/" }), { baseUrl: "https://tasks-api.onrender.com", expectCommit: null, timeoutSeconds: 900, intervalSeconds: 10 });
  assert.deepEqual(f({ BASE_URL: "http://localhost:3925", EXPECT_COMMIT: "2cb197c", TIMEOUT_SECONDS: "3", INTERVAL_SECONDS: "1" }), { baseUrl: "http://localhost:3925", expectCommit: "2cb197c", timeoutSeconds: 3, intervalSeconds: 1 });
  assert.equal(f({ BASE_URL: "https://a.com", EXPECT_COMMIT: "" }).expectCommit, null, "ריק = לא הוגדר");
  assert.equal(f({ BASE_URL: "https://a.com", EXPECT_COMMIT: "2cb197caebad857cf5eed6c8d1ddd582085d5dca" }).expectCommit.length, 40);
});
test("שגיאות", async () => {
  const f = await get();
  assert.throws(() => f({}), { message: "חסר BASE_URL" });
  for (const b of ["tasks-api.onrender.com", "ftp://a.com", "https://"]) assert.throws(() => f({ BASE_URL: b }), { message: "BASE_URL לא תקין" }, b);
  for (const c of ["2cb19", "2CB197C", "2cb197g", "x".repeat(41)]) assert.throws(() => f({ BASE_URL: "https://a.com", EXPECT_COMMIT: c }), { message: "EXPECT_COMMIT לא תקין" }, c);
  for (const v of ["0", "-5", "1.5", "abc"]) {
    assert.throws(() => f({ BASE_URL: "https://a.com", TIMEOUT_SECONDS: v }), /TIMEOUT_SECONDS/, v);
    assert.throws(() => f({ BASE_URL: "https://a.com", INTERVAL_SECONDS: v }), /INTERVAL_SECONDS/, v);
  }
  assert.throws(() => f({ BASE_URL: "https://a.com", TIMEOUT_SECONDS: "5", INTERVAL_SECONDS: "10" }), { message: "INTERVAL_SECONDS גדול מ־TIMEOUT_SECONDS" });
});
