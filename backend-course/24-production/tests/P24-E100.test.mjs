import { test } from "node:test";
import assert from "node:assert/strict";
import { HttpException } from "@nestjs/common";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E100.ts", ["LoginRateLimitGuard"])).LoginRateLimitGuard;
function ctx(ip) {
  const headers = {};
  const context = { switchToHttp: () => ({ getRequest: () => ({ ip }), getResponse: () => ({ setHeader: (k, v) => { headers[k.toLowerCase()] = v; } }) }) };
  return { context, headers };
}

test("מותר עד המגבלה, עם headers", async () => {
  const Guard = await get();
  let t = Date.parse("2026-11-07T12:00:00Z");
  const guard = new Guard(3, { now: () => new Date(t) });
  for (let i = 0; i < 3; i++) {
    const { context, headers } = ctx("1.1.1.1");
    assert.equal(guard.canActivate(context), true);
    assert.deepEqual(headers, { "ratelimit-limit": "3", "ratelimit-remaining": String(2 - i), "ratelimit-reset": String(60 - i * 10) });
    t += 10_000;
  }
});
test("חסום ← 429 עם Retry-After; לא נספר; IP אחר פתוח", async () => {
  const Guard = await get();
  let t = 0;
  const guard = new Guard(2, { now: () => new Date(t) });
  guard.canActivate(ctx("6.6.6.6").context);
  t = 5000;
  guard.canActivate(ctx("6.6.6.6").context);
  t = 20_000;
  const { context, headers } = ctx("6.6.6.6");
  let err;
  try { guard.canActivate(context); } catch (e) { err = e; }
  assert.ok(err instanceof HttpException, "זורק HttpException");
  assert.equal(err.getStatus(), 429);
  assert.equal(err.getResponse().error.code, "TOO_MANY_REQUESTS");
  assert.match(err.getResponse().error.message, /40/);
  assert.equal(headers["retry-after"], "40");
  assert.equal(headers["ratelimit-remaining"], "0");
  assert.equal(guard.canActivate(ctx("7.7.7.7").context), true);
  for (let i = 0; i < 5; i++) assert.throws(() => guard.canActivate(ctx("6.6.6.6").context));
  t = 60_000;
  assert.equal(guard.canActivate(ctx("6.6.6.6").context), true, "הראשונה יצאה מהחלון; החסומות לא נספרו");
});
test("ברירת מחדל: Retry-After לא קיים כשמותר", async () => {
  const Guard = await get();
  const guard = new Guard(5, { now: () => new Date(0) });
  const { context, headers } = ctx("1.1.1.1");
  guard.canActivate(context);
  assert.equal(headers["retry-after"], undefined);
});
