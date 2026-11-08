import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load } from "../../tools/load.mjs";

const { clientIp } = await load(import.meta.url, "P25-E18.ts");

test("בלי proxy (hops=0) — מי שהתחבר", () => {
  assert.equal(clientIp("203.0.113.7", undefined, 0), "203.0.113.7");
  assert.equal(clientIp("203.0.113.7", "1.2.3.4", 0), "203.0.113.7", "header מזויף — מתעלמים");
});
test("proxy אחד (Render, Caddy)", () => {
  assert.equal(clientIp("10.0.0.5", "203.0.113.7", 1), "203.0.113.7");
  assert.equal(clientIp("10.0.0.5", "1.2.3.4, 203.0.113.7", 1), "203.0.113.7", "הלקוח כתב 1.2.3.4 — ה־proxy הוסיף את האמיתי בסוף");
});
test("שני proxies (CDN ← load balancer)", () => {
  assert.equal(clientIp("10.0.0.5", "1.2.3.4, 203.0.113.7, 172.16.0.9", 2), "203.0.113.7");
});
test("רשימה קצרה מ־hops — הכתובת הכי רחוקה שיש", () => {
  assert.equal(clientIp("10.0.0.5", "203.0.113.7", 3), "203.0.113.7");
  assert.equal(clientIp("10.0.0.5", undefined, 1), "10.0.0.5");
});
test("כמו Express", async () => {
  for (const [xff, hops] of [["1.2.3.4, 203.0.113.7", 1], ["9.9.9.9, 1.2.3.4, 203.0.113.7", 2], [undefined, 1], ["a.b", 0]]) {
    const app = express();
    app.set("trust proxy", hops);
    const req = Object.create(app.request, { headers: { value: xff ? { "x-forwarded-for": xff } : {} }, socket: { value: { remoteAddress: "10.0.0.5" } }, connection: { value: { remoteAddress: "10.0.0.5" } } });
    req.app = app;
    assert.equal(clientIp("10.0.0.5", xff, hops), req.ip, `XFF=${xff} hops=${hops}`);
  }
});
