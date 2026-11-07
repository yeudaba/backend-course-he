import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

// יחידה 15.5: CORS — רק הדף שלנו רשאי לקרוא ל־API מהדפדפן
const { createApp } = await load(import.meta.url, "tasks-api/src/app.ts");

async function start(t, options) {
  const { base, close } = await listen(createApp(options));
  t.after(close);
  return (method, origin, headers = {}) => fetch(base + "/tasks", { method, headers: { Origin: origin, ...headers }, signal: AbortSignal.timeout(3000) });
}

test("preflight מהדף (localhost:5500)", async (t) => {
  const send = await start(t);
  const res = await send("OPTIONS", "http://localhost:5500", { "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "content-type" });
  assert.ok(res.status === 204 || res.status === 200, `preflight צריך להצליח, קיבלנו ${res.status}`);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /PATCH/);
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /DELETE/);
  assert.match((res.headers.get("access-control-allow-headers") ?? "").toLowerCase(), /content-type/);
});
test("GET מהדף מקבל את ה־header", async (t) => {
  const send = await start(t);
  const res = await send("GET", "http://localhost:5500");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
});
test("אתר זר — בלי header", async (t) => {
  const send = await start(t);
  const res = await send("GET", "https://evil.example");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.notEqual(res.headers.get("access-control-allow-origin"), "*");
});
test("corsOrigins מוזרק", async (t) => {
  const send = await start(t, { corsOrigins: ["https://tasks.example.com"] });
  assert.equal((await send("GET", "https://tasks.example.com")).headers.get("access-control-allow-origin"), "https://tasks.example.com");
  assert.equal((await send("GET", "http://localhost:5500")).headers.get("access-control-allow-origin"), null);
});
