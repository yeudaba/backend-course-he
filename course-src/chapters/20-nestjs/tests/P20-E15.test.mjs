import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { PingModule, LOGGER, TimingInterceptor } = loadNest(import.meta.url, "P20-E15.ts");

test("נרשם לכל האפליקציה: APP_INTERCEPTOR ב־providers של ה־module", () => {
  const { APP_INTERCEPTOR } = createRequire(import.meta.url)("@nestjs/core");
  const providers = Reflect.getMetadata("providers", PingModule) ?? [];
  const global = providers.find((p) => p && typeof p === "object" && p.provide === APP_INTERCEPTOR);
  assert.ok(global, "לא מצאנו { provide: APP_INTERCEPTOR, useClass: TimingInterceptor } ב־providers של PingModule — @UseInterceptors על controller חל רק עליו, לא על כל האפליקציה");
  assert.equal(global.useClass, TimingInterceptor, "APP_INTERCEPTOR צריך להצביע על TimingInterceptor (useClass)");
});

test("X-Response-Time ושורת לוג", async (t) => {
  const lines = [];
  const { call } = await nestApp(t, PingModule, { overrides: [[LOGGER, { log: (l) => lines.push(l) }]] });
  let res = await call("GET", "/ping");
  assert.deepEqual(res.body, { pong: true });
  assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/, "header בצורה 12ms");
  res = await call("GET", "/slow");
  const ms = Number(res.headers.get("x-response-time")?.replace("ms", ""));
  assert.ok(ms >= 50, `/slow לוקח לפחות 60ms, קיבלנו ${ms}`);
  assert.equal(lines.length, 2, "שורת לוג לכל בקשה");
  assert.match(lines[0], /^GET \/ping 200 \d+ms$/);
  assert.match(lines[1], /^GET \/slow 200 \d+ms$/);
});
