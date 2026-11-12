import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E52.ts", ["parseCorsOrigins"])).parseCorsOrigins;

test("פרודקשן — תקין", async () => {
  const f = await get();
  assert.deepEqual(f("https://tasks-web.onrender.com", "production"), ["https://tasks-web.onrender.com"]);
  assert.deepEqual(f(" https://a.com , https://b.com:8443,,https://a.com ", "production"), ["https://a.com", "https://b.com:8443"]);
});
test("פרודקשן — חסר או לא תקין", async () => {
  const f = await get();
  for (const v of [undefined, "", " , "]) assert.throws(() => f(v, "production"), { message: "CORS_ORIGINS חובה בפרודקשן" }, String(v));
  assert.throws(() => f("http://localhost:5500,https://ok.com,*,https://a.com/,https://*.a.com", "production"), {
    message: "CORS_ORIGINS לא תקין: http://localhost:5500, *, https://a.com/, https://*.a.com",
  });
});
test("פיתוח ובדיקות", async () => {
  const f = await get();
  assert.deepEqual(f(undefined, "development"), ["http://localhost:5500"]);
  assert.deepEqual(f("", "test"), ["http://localhost:5500"]);
  assert.deepEqual(f("http://localhost:5500,https://staging.example.com", "development"), ["http://localhost:5500", "https://staging.example.com"]);
  assert.throws(() => f("http://localhost:5500/", "development"), { message: "CORS_ORIGINS לא תקין: http://localhost:5500/" });
  assert.throws(() => f("localhost:5500", "test"), { message: "CORS_ORIGINS לא תקין: localhost:5500" });
});
