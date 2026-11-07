import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { PingModule, LOGGER } = loadNest(import.meta.url, "P20-E15.ts");

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
