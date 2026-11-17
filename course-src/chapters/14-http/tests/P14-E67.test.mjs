import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E67.mjs", ["networkSummary"])).networkSummary;

test("סיכום", async () => {
  const f = await get();
  const entries = [
    { url: "https://news.test/", method: "GET", status: 200, contentType: "text/html", size: 51200, ms: 120 },
    { url: "https://news.test/api/a?page=1", method: "GET", status: 200, contentType: "application/JSON; charset=utf-8", size: 8300, ms: 340 },
    { url: "https://cdn.test:8443/app.js", method: "GET", status: 304, contentType: "text/javascript", size: 0, ms: 90 },
    { url: "https://ads.test/pixel", method: "GET", status: 0, size: 0, ms: 3000 },
    { url: "https://news.test/api/me", method: "POST", status: 401, contentType: "application/problem+json", size: 120, ms: 30 },
    { url: "https://news.test/api/b", method: "GET", status: 503, contentType: "text/plain", size: 10, ms: 3000 },
    { url: "https://news.test/api/c", method: "GET", status: 399, size: 5, ms: 1 },
  ];
  assert.deepEqual(f(entries), {
    count: 7,
    bytes: 59635,
    failed: 3,
    json: 2,
    slowest: "https://ads.test/pixel",
    byHost: { "news.test": 5, "cdn.test:8443": 1, "ads.test": 1 },
  });
});
test("רשימה ריקה", async () => {
  const f = await get();
  assert.deepEqual(f([]), { count: 0, bytes: 0, failed: 0, json: 0, slowest: null, byHost: {} });
});
test("רשומה אחת", async () => {
  const f = await get();
  assert.deepEqual(f([{ url: "http://localhost:4000/products", method: "GET", status: 404, contentType: "application/json", size: 30, ms: 5 }]), {
    count: 1,
    bytes: 30,
    failed: 1,
    json: 1,
    slowest: "http://localhost:4000/products",
    byHost: { "localhost:4000": 1 },
  });
});
