import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t, now) {
  const { todayRouter } = await exportsOf(import.meta.url, "P24-E59.ts", ["todayRouter"]);
  const app = express();
  app.use(todayRouter(now ? { now: () => new Date(now) } : undefined));
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("ישראל, UTC וניו יורק באותו רגע", async (t) => {
  const call = await start(t, "2026-11-04T22:30:00Z");
  assert.deepEqual((await call("GET", "/today?tz=Asia/Jerusalem")).body, { tz: "Asia/Jerusalem", date: "2026-11-05", time: "00:30" });
  assert.deepEqual((await call("GET", "/today")).body, { tz: "UTC", date: "2026-11-04", time: "22:30" });
  assert.deepEqual((await call("GET", "/today?tz=America/New_York")).body, { tz: "America/New_York", date: "2026-11-04", time: "17:30" });
});
test("שם קנוני, וחצות = 00", async (t) => {
  const call = await start(t, "2026-07-01T21:00:00Z");
  const r = await call("GET", "/today?tz=asia/jerusalem");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { tz: "Asia/Jerusalem", date: "2026-07-02", time: "00:00" });
});
test("אזור לא תקין ← 400", async (t) => {
  const call = await start(t, "2026-07-01T21:00:00Z");
  for (const q of ["?tz=Mars/Olympus", "?tz=", "?tz=a&tz=b"]) {
    const r = await call("GET", "/today" + q);
    assert.equal(r.status, 400, q);
    assert.equal(r.body.error.code, "INVALID_TIME_ZONE", q);
    assert.equal(typeof r.body.error.message, "string");
  }
});
test("ברירת מחדל: שעון אמיתי", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/today");
  assert.equal(r.body.date, new Date().toISOString().slice(0, 10));
});
