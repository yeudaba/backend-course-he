import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P24-E24.ts");
async function start(t, opts = {}) {
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const lines = [];
  const app = createApp({ clock: () => clock.now, logSink: (l) => lines.push(l), ...opts });
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  const as = (user) => (method, path, body, headers = {}) => call(method, path, body, { headers: { "x-user-id": user, ...headers } });
  const settle = () => new Promise((r) => setTimeout(r, 20));
  return { app, call, as, clock, settle, logs: () => lines.map((l) => JSON.parse(l)) };
}
const key = (k) => ({ "Idempotency-Key": k });

test("הזמנה, replay ו־GET", async (t) => {
  const { as } = await start(t);
  const dana = as("dana");
  const r = await dana("POST", "/orders", { item: " ספר ", quantity: 2 }, key("order-0001"));
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("location"), "/orders/1");
  assert.deepEqual(r.body, { id: 1, userId: "dana", item: "ספר", quantity: 2, createdAt: "2026-11-04T10:00:00.000Z" });
  const again = await dana("POST", "/orders", { item: " ספר ", quantity: 2 }, key("order-0001"));
  assert.deepEqual(again.body, r.body);
  assert.equal(again.headers.get("idempotent-replayed"), "true");
  assert.equal((await dana("GET", "/orders")).body.length, 1);
  assert.deepEqual((await as("yossi")("GET", "/orders")).body, [], "כל משתמש רואה רק את שלו");
});
test("שגיאות — עם code ו־requestId", async (t) => {
  const { as, call } = await start(t, { rateLimitPerMinute: 100 });
  const dana = as("dana");
  const cases = [
    [await call("GET", "/orders"), 401, "UNAUTHORIZED"],
    [await dana("POST", "/orders", { item: "x", quantity: 1 }), 400, "IDEMPOTENCY_KEY_REQUIRED"],
    [await dana("POST", "/orders", { item: "", quantity: 1 }, key("order-0002")), 400, "VALIDATION_ERROR"],
    [await dana("POST", "/orders", { item: "x", quantity: 101 }, key("order-0003")), 400, "VALIDATION_ERROR"],
    [await dana("GET", "/nope"), 404, "NOT_FOUND"],
    [await call("POST", "/orders", undefined, { raw: "{bad", headers: { "x-user-id": "dana", ...key("order-0004") } }), 400, "INVALID_JSON"],
  ];
  for (const [res, status, code] of cases) {
    assert.equal(res.status, status, code);
    assert.equal(res.body.error.code, code);
    assert.equal(res.body.error.requestId, res.headers.get("x-request-id"), `${code}: requestId בגוף = ב־header`);
  }
  assert.equal((await dana("POST", "/orders", { item: "x", quantity: 1 }, key("order-0002"))).status, 201, "בקשה לא תקינה לא \"תפסה\" את המפתח");
  await dana("POST", "/orders", { item: "y", quantity: 1 }, key("order-0005"));
  const mismatch = await dana("POST", "/orders", { item: "z", quantity: 1 }, key("order-0005"));
  assert.equal(mismatch.status, 422);
  assert.equal(mismatch.body.error.code, "IDEMPOTENCY_KEY_REUSED");
});
test("X-Request-Id", async (t) => {
  const { call } = await start(t);
  assert.equal((await call("GET", "/health", undefined, { headers: { "X-Request-Id": "abc-123" } })).headers.get("x-request-id"), "abc-123");
  assert.match((await call("GET", "/health", undefined, { headers: { "X-Request-Id": "bad id" } })).headers.get("x-request-id"), /^[0-9a-f-]{36}$/);
});
test("לוגים", async (t) => {
  const { as, settle, logs } = await start(t);
  const res = await as("dana")("POST", "/orders?coupon=SECRET10", { item: "x", quantity: 1 }, { ...key("order-0001"), "X-Request-Id": "trace-1" });
  await as("dana")("GET", "/missing");
  await settle();
  const line = logs().find((l) => l.requestId === "trace-1");
  assert.ok(line, "שורת לוג עם ה־requestId");
  assert.equal(res.status, 201);
  for (const [k, v] of Object.entries({ time: "2026-11-04T10:00:00.000Z", level: "info", msg: "request", userId: "dana", method: "POST", path: "/orders", status: 201 })) {
    assert.equal(line[k], v, k);
  }
  assert.equal(typeof line.durationMs, "number");
  assert.equal(logs().at(-1).level, "warn", "404 ← warn");
  assert.ok(!JSON.stringify(logs()).includes("SECRET10"));
});
test("הגבלת קצב לכל משתמש", async (t) => {
  const { as, clock } = await start(t, { rateLimitPerMinute: 3 });
  const dana = as("dana");
  for (let i = 1; i <= 3; i++) assert.equal((await dana("POST", "/orders", { item: "x", quantity: i }, key(`order-000${i}`))).status, 201);
  clock.now = new Date("2026-11-04T10:00:20.000Z");
  const r = await dana("POST", "/orders", { item: "x", quantity: 9 }, key("order-0009"));
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "40");
  assert.equal(r.body.error.code, "TOO_MANY_REQUESTS");
  assert.equal((await as("yossi")("POST", "/orders", { item: "x", quantity: 1 }, key("order-0001"))).status, 201, "ליוסי — מגבלה משלו");
  assert.equal((await dana("GET", "/orders")).status, 200, "רק POST מוגבל");
  clock.now = new Date("2026-11-04T10:01:00.000Z");
  assert.equal((await dana("POST", "/orders", { item: "x", quantity: 9 }, key("order-0009"))).status, 201);
});
test("health ו־ready", async (t) => {
  const { app, call } = await start(t);
  assert.equal((await call("GET", "/health")).status, 200);
  assert.equal((await call("GET", "/ready")).status, 200);
  app.locals.draining = true;
  const r = await call("GET", "/ready");
  assert.equal(r.status, 503);
  assert.equal(r.body.error.code, "DRAINING");
  assert.equal((await call("GET", "/health")).status, 200, "health — \"התהליך חי\"; ready — \"שלחו לי תנועה\"");
});
