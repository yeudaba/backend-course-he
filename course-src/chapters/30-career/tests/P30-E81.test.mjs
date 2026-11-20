import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { incidentNumbers } = await load(import.meta.url, "P30-E81.ts");
const T0 = Date.UTC(2026, 10, 3, 14, 0, 0);
const L = (sec, o) => JSON.stringify({ time: T0 + sec * 1000, pid: 1, ...o });

test("תקלה מלאה", () => {
  const lines = [
    L(-60, { level: 30, msg: "deploy", version: "1.4.1" }),
    L(0, { level: 50, msg: "db timeout" }),
    L(10, { level: 50, msg: "db timeout" }),
    "not json",
    L(70, { level: 60, msg: "fatal" }),
    L(75, { level: 50, msg: "x" }),
    L(80, { level: 50, msg: "x" }),
    L(600, { level: 30, msg: "deploy", version: "1.4.2" }),
    L(30, { level: 40, msg: "warn" }),
    L(780, { level: 50, msg: "last" }),
    L(900, { level: 30, msg: "deploy", version: "1.4.3" }),
    JSON.stringify({ level: 50, msg: "no time" }),
  ];
  assert.deepEqual(incidentNumbers(lines), {
    errors: 6,
    firstErrorAt: "2026-11-03T14:00:00.000Z",
    lastErrorAt: "2026-11-03T14:13:00.000Z",
    minutes: 13,
    peakPerMinute: 3,
    fixedBy: "1.4.2",
  });
});
test("סדר מעורבב, בלי deploy, בלי שגיאות", () => {
  const lines = [L(125, { level: 50 }), L(5, { level: 50 }), L(61, { level: 50 })];
  assert.deepEqual(incidentNumbers(lines), { errors: 3, firstErrorAt: "2026-11-03T14:00:05.000Z", lastErrorAt: "2026-11-03T14:02:05.000Z", minutes: 2, peakPerMinute: 1, fixedBy: null });
  assert.deepEqual(incidentNumbers([L(0, { level: 30, msg: "deploy", version: "1" })]), { errors: 0, firstErrorAt: null, lastErrorAt: null, minutes: 0, peakPerMinute: 0, fixedBy: null });
  assert.equal(incidentNumbers([L(0, { level: 50 })]).minutes, 0);
});
test("deploy בדיוק ברגע של השגיאה הראשונה — נחשב תיקון", () => {
  const r = incidentNumbers([L(0, { level: 50, msg: "x" }), L(0, { level: 30, msg: "deploy", version: "2.0.0" }), L(120, { level: 50, msg: "x" })]);
  assert.notEqual(r.fixedBy, null);
});
test("deploy בדיוק ברגע של השגיאה האחרונה — נחשב", () => {
  const r = incidentNumbers([L(0, { level: 50, msg: "x" }), L(120, { level: 50, msg: "x" }), L(120, { level: 30, msg: "deploy", version: "2.0.1" })]);
  assert.equal(r.fixedBy, "2.0.1");
});
