import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E96.ts", ["requestLogEntry"])).requestLogEntry;
const base = { method: "GET", originalUrl: "/tasks", status: 200, durationMs: 12.4, requestId: "r1" };

test("שדות", async () => {
  const f = await get();
  assert.deepEqual(f({ ...base, originalUrl: "/reset?token=abc", userId: 7 }), {
    level: "info", msg: "request", fields: { method: "GET", path: "/reset", status: 200, durationMs: 12, requestId: "r1", userId: 7 },
  });
  assert.deepEqual(Object.keys(f(base).fields).sort(), ["durationMs", "method", "path", "requestId", "status"], "בלי userId כשאין");
  assert.equal(f({ ...base, durationMs: 12.5 }).fields.durationMs, 13);
});
test("רמות", async () => {
  const f = await get();
  const lvl = (status, url = "/tasks") => f({ ...base, status, originalUrl: url }).level;
  assert.equal(lvl(200), "info");
  assert.equal(lvl(201), "info");
  assert.equal(lvl(304), "info");
  assert.equal(lvl(404), "warn");
  assert.equal(lvl(429), "warn");
  assert.equal(lvl(500), "error");
  assert.equal(lvl(503), "error");
  assert.equal(lvl(200, "/health"), "debug");
  assert.equal(lvl(200, "/health?x=1"), "debug");
  assert.equal(lvl(503, "/health"), "error", "health שנכשל — לא debug");
  assert.equal(lvl(404, "/health"), "warn");
  assert.equal(lvl(200, "/healthz"), "info");
});
