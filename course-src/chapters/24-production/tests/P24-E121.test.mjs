import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E121.ts", ["toLogEntry"])).toLogEntry;
const info = (over = {}) => ({ method: "GET", url: "/tasks", status: 200, ms: 12.34, requestId: "r1", headers: { authorization: "Bearer secret-token", cookie: "sid=1" }, ...over });

test("רק השדות המותרים", async () => {
  const f = await get();
  assert.deepEqual(f(info()), { level: "info", msg: "request", requestId: "r1", method: "GET", path: "/tasks", status: 200, ms: 12.3 });
  const text = JSON.stringify(f(info({ url: "/tasks?token=abc123&email=a@b.c" })));
  for (const secret of ["secret-token", "sid=1", "abc123", "a@b.c", "headers", "url"]) assert.ok(!text.includes(secret), `"${secret}" נמצא בשורת הלוג`);
});
test("path בלי query", async () => {
  const f = await get();
  assert.equal(f(info({ url: "/tasks/7?include=all" })).path, "/tasks/7");
  assert.equal(f(info({ url: "/health" })).path, "/health");
});
test("level לפי status, כולל הגבולות", async () => {
  const f = await get();
  const lv = (status) => f(info({ status })).level;
  assert.equal(lv(500), "error", "500 בדיוק — error");
  assert.equal(lv(503), "error");
  assert.equal(lv(400), "warn", "400 בדיוק — warn");
  assert.equal(lv(404), "warn");
  assert.equal(lv(499), "warn");
  assert.equal(lv(399), "info");
  assert.equal(lv(201), "info");
});
test("ms לספרה אחת", async () => {
  const f = await get();
  assert.equal(f(info({ ms: 0.04 })).ms, 0);
  assert.equal(f(info({ ms: 99.96 })).ms, 100);
  assert.equal(f(info({ ms: 7 })).ms, 7);
});
