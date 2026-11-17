import { test } from "node:test";
import assert from "node:assert/strict";
import { HttpException, NotFoundException } from "@nestjs/common";
import { exportsOf } from "./_ts.mjs";

async function run(exception, requestId = "req-5") {
  const { RequestIdErrorFilter } = await exportsOf(import.meta.url, "P24-E108.ts", ["RequestIdErrorFilter"]);
  const logs = [];
  const out = {};
  const res = {
    getHeader: (n) => (n.toLowerCase() === "x-request-id" ? requestId : undefined),
    status(s) { out.status = s; return this; },
    json(b) { out.body = b; return this; },
  };
  const host = { switchToHttp: () => ({ getResponse: () => res, getRequest: () => ({}) }) };
  new RequestIdErrorFilter((level, msg, fields) => logs.push({ level, msg, fields })).catch(exception, host);
  return { ...out, logs };
}

test("HttpException — status, code ו־requestId", async () => {
  const a = await run(new NotFoundException("משימה 7 לא נמצאה"));
  assert.deepEqual([a.status, a.body], [404, { error: { code: "NOT_FOUND", message: "משימה 7 לא נמצאה", requestId: "req-5" } }]);
  assert.deepEqual(a.logs, [{ level: "warn", msg: "http error", fields: { status: 404, requestId: "req-5" } }]);
  for (const [s, c] of [[400, "BAD_REQUEST"], [401, "UNAUTHORIZED"], [403, "FORBIDDEN"], [429, "TOO_MANY_REQUESTS"], [418, "ERROR"]]) {
    const r = await run(new HttpException("x", s));
    assert.deepEqual([r.status, r.body.error.code], [s, c], String(s));
  }
  const svc = await run(new HttpException("maintenance", 503));
  assert.equal(svc.status, 503);
  assert.deepEqual(svc.logs, [], "5xx מ־HttpException — לא warn");
});
test("שגיאה לא צפויה ← 500 בלי לחשוף", async () => {
  const r = await run(new Error('relation "tasks" does not exist'));
  assert.deepEqual([r.status, r.body], [500, { error: { code: "INTERNAL", message: "שגיאה פנימית", requestId: "req-5" } }]);
  assert.deepEqual(r.logs, [{ level: "error", msg: "unhandled", fields: { requestId: "req-5", message: 'relation "tasks" does not exist' } }]);
  const s = await run("thrown string");
  assert.equal(s.status, 500);
  assert.equal(s.logs[0].fields.message, "thrown string");
});
test("בלי X-Request-Id ← null", async () => {
  const r = await run(new Error("x"), null);
  assert.equal(r.body.error.requestId, null);
});
