import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { GreetingModule, CLOCK } = loadNest(import.meta.url, "P20-E11.ts");

test("ברכה לפי השעה (UTC)", async (t) => {
  assert.equal(CLOCK, "CLOCK");
  const clock = { now: () => new Date("2026-11-04T08:00:00Z") };
  const { call } = await nestApp(t, GreetingModule, { overrides: [[CLOCK, { now: () => clock.now() }]] });
  const cases = [["04:59", "לילה טוב"], ["05:00", "בוקר טוב"], ["11:59", "בוקר טוב"], ["12:00", "צהריים טובים"], ["16:59", "צהריים טובים"], ["17:00", "ערב טוב"], ["20:59", "ערב טוב"], ["21:00", "לילה טוב"], ["00:30", "לילה טוב"]];
  for (const [time, expected] of cases) {
    clock.now = () => new Date(`2026-11-04T${time}:00Z`);
    assert.deepEqual((await call("GET", "/greeting")).body, { greeting: expected }, time);
  }
});
test("בלי override — השעון האמיתי עובד", async (t) => {
  const { call } = await nestApp(t, GreetingModule);
  const res = await call("GET", "/greeting");
  assert.equal(res.status, 200);
  assert.ok(["בוקר טוב", "צהריים טובים", "ערב טוב", "לילה טוב"].includes(res.body.greeting));
});
