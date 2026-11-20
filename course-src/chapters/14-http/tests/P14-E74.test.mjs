import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P14-E74.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["failedAsCurl"])).failedAsCurl;

test("הדוגמה מהמשימה", async () => {
  const failedAsCurl = await get();
  assert.deepEqual(failedAsCurl([{ method: "POST", url: "http://x/orders", status: 500, startedAt: 2, headers: { Accept: "application/json", Cookie: "sid=1" } }]), ["curl -X POST 'http://x/orders' -H 'Accept: application/json'"]);
});

test("רק כישלונות (0 ו־400 ומעלה), בלי כפילויות, ממוין לפי startedAt", async () => {
  const failedAsCurl = await get();
  const entries = [
    { method: "GET", url: "http://s/api/me", status: 401, startedAt: 30, headers: { Accept: "application/json" } },
    { method: "POST", url: "http://s/api/orders", status: 500, startedAt: 10, headers: { "Content-Type": "application/json", cookie: "sid=8f3a" } },
    { method: "GET", url: "http://s/", status: 200, startedAt: 1 },
    { method: "GET", url: "http://s/redirect", status: 302, startedAt: 2 },
    { method: "GET", url: "http://s/bad", status: 400, startedAt: 3 },
    { method: "GET", url: "http://s/ok", status: 399, startedAt: 4 },
    { method: "GET", url: "http://s/api/me", status: 401, startedAt: 20 },
    { method: "DELETE", url: "http://s/api/me", status: 403, startedAt: 25 },
    { method: "GET", url: "http://ads/pixel", status: 0, startedAt: 5 },
  ];
  const copy = structuredClone(entries);
  assert.deepEqual(failedAsCurl(entries), [
    "curl 'http://s/bad'",
    "curl 'http://ads/pixel'",
    "curl -X POST 'http://s/api/orders' -H 'Content-Type: application/json'",
    "curl 'http://s/api/me'",
    "curl -X DELETE 'http://s/api/me'",
  ]);
  assert.deepEqual(entries, copy, "את הקלט לא משנים (sort על עותק)");
});

test("כפילות — נשארת הרשומה המוקדמת (עם ה־headers שלה)", async () => {
  const failedAsCurl = await get();
  const out = failedAsCurl([
    { method: "GET", url: "http://s/x", status: 500, startedAt: 9, headers: { "X-Try": "2" } },
    { method: "GET", url: "http://s/x", status: 500, startedAt: 3, headers: { "X-Try": "1", COOKIE: "a=1" } },
  ]);
  assert.deepEqual(out, ["curl 'http://s/x' -H 'X-Try: 1'"]);
  assert.deepEqual(failedAsCurl([]), []);
});
