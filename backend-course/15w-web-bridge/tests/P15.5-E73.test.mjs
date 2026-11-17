import { test } from "node:test";
import assert from "node:assert/strict";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_src.mjs";

async function start(t, opts) {
  const { createApp } = await exportsOf(import.meta.url, "P15.5-E73.mjs", ["createApp"]);
  const { base, close } = await listen(opts ? createApp(opts) : createApp());
  t.after(close);
  return (method, headers = {}, body) => fetch(base + "/tasks", { method, headers, body });
}
const pre = (origin) => ({ Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-api-key" });

test("preflight עובר לפני בדיקת המפתח", async (t) => {
  const send = await start(t);
  const r = await send("OPTIONS", pre("http://localhost:5500"));
  assert.equal(r.status, 204, "preflight בלי מפתח ← 204 (cors ראשון)");
  assert.equal(r.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.match(r.headers.get("access-control-allow-headers") ?? "", /x-api-key/i);
});
test("בקשות אמיתיות", async (t) => {
  const send = await start(t);
  const json = { Origin: "http://localhost:5500", "Content-Type": "application/json", "x-api-key": "demo-key" };
  let r = await send("POST", json, '{"title":"  חלב "}');
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.deepEqual(await r.json(), { id: 1, title: "חלב" });
  r = await send("POST", json, '{"title":"   "}');
  assert.equal(r.status, 400);
  r = await send("GET", { Origin: "http://localhost:5500", "x-api-key": "demo-key" });
  assert.deepEqual(await r.json(), [{ id: 1, title: "חלב" }]);
  r = await send("GET", { Origin: "http://localhost:5500" });
  assert.equal(r.status, 401, "בלי מפתח ← 401");
  assert.deepEqual(await r.json(), { error: { code: "UNAUTHORIZED", message: "חסר מפתח" } });
  assert.equal(r.headers.get("access-control-allow-origin"), "http://localhost:5500", "גם ל־401 יש header — כדי שהדף יוכל לקרוא את השגיאה");
});
test("מקור זר ו־corsOrigins משלך", async (t) => {
  const send = await start(t, { corsOrigins: ["https://app.example.com"] });
  let r = await send("GET", { Origin: "http://localhost:5500", "x-api-key": "demo-key" });
  assert.equal(r.headers.get("access-control-allow-origin"), null, "ברירת המחדל הוחלפה");
  r = await send("OPTIONS", pre("https://app.example.com"));
  assert.equal(r.headers.get("access-control-allow-origin"), "https://app.example.com");
  r = await send("OPTIONS", pre("https://evil.example"));
  assert.equal(r.headers.get("access-control-allow-origin"), null);
});
test("כל אפליקציה עם רשימה משלה", async (t) => {
  const a = await start(t);
  const b = await start(t);
  await a("POST", { "Content-Type": "application/json", "x-api-key": "demo-key" }, '{"title":"x"}');
  assert.deepEqual(await (await b("GET", { "x-api-key": "demo-key" })).json(), []);
});
