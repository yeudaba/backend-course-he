import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { nextRun, upcoming } = await load(import.meta.url, "P24-E25.ts");
const IL = "Asia/Jerusalem";
const at = (s) => new Date(s);
const iso = (d) => d.toISOString();

test("כל יום ב־09:00", () => {
  const s = { hour: 9, minute: 0 };
  assert.equal(iso(nextRun(s, at("2026-11-04T05:00:00Z"), IL)), "2026-11-04T07:00:00.000Z", "07:00 בישראל ← היום ב־09:00");
  assert.equal(iso(nextRun(s, at("2026-11-04T07:00:00Z"), IL)), "2026-11-05T07:00:00.000Z", "בדיוק ב־09:00 ← מחר (after לא כולל)");
  assert.equal(iso(nextRun(s, at("2026-11-04T22:30:00Z"), IL)), "2026-11-05T07:00:00.000Z", "00:30 ב־5.11 בישראל");
  assert.equal(iso(nextRun(s, at("2026-11-04T22:30:00Z"), "UTC")), "2026-11-05T09:00:00.000Z");
  assert.equal(iso(nextRun(s, at("2026-11-04T22:30:00Z"), "America/New_York")), "2026-11-05T14:00:00.000Z");
});
test("ימים בשבוע", () => {
  // 6.11.2026 — יום שישי
  const weekdays = { hour: 8, minute: 30, days: [0, 1, 2, 3, 4] };
  assert.equal(iso(nextRun(weekdays, at("2026-11-06T05:00:00Z"), IL)), "2026-11-08T06:30:00.000Z", "שישי ← ראשון");
  assert.equal(iso(nextRun({ hour: 20, minute: 0, days: [6] }, at("2026-11-07T18:00:00Z"), IL)), "2026-11-14T18:00:00.000Z", "בדיוק עכשיו ← שבוע הבא");
  assert.equal(iso(nextRun({ hour: 0, minute: 15, days: [4] }, at("2026-11-04T22:00:00Z"), IL)), "2026-11-04T22:15:00.000Z", "יום חמישי בישראל, כשב־UTC עדיין רביעי");
});
test("מעבר לשעון קיץ", () => {
  const s = { hour: 9, minute: 0 };
  assert.deepEqual(upcoming(s, at("2026-03-25T12:00:00Z"), IL, 3).map(iso), ["2026-03-26T07:00:00.000Z", "2026-03-27T06:00:00.000Z", "2026-03-28T06:00:00.000Z"], "תמיד 09:00 על השעון");
  assert.equal(iso(nextRun({ hour: 2, minute: 30 }, at("2026-03-26T12:00:00Z"), IL)), "2026-03-27T00:30:00.000Z", "02:30 לא קיימת ← 03:30");
});
test("חזרה לשעון חורף: פעם אחת", () => {
  const s = { hour: 1, minute: 30 };
  const runs = upcoming(s, at("2026-10-24T12:00:00Z"), IL, 2).map(iso);
  assert.deepEqual(runs, ["2026-10-24T22:30:00.000Z", "2026-10-25T23:30:00.000Z"], "01:30 קורית פעמיים ב־25.10 — מריצים רק בראשונה");
});
test("upcoming", () => {
  assert.equal(upcoming({ hour: 9, minute: 0 }, at("2026-11-04T00:00:00Z"), IL, 5).length, 5);
  assert.deepEqual(upcoming({ hour: 9, minute: 0 }, at("2026-11-04T00:00:00Z"), IL, 0), []);
});
test("קלט לא תקין", () => {
  for (const s of [{ hour: 24, minute: 0 }, { hour: 9, minute: 60 }, { hour: 9.5, minute: 0 }, { hour: 9, minute: 0, days: [] }, { hour: 9, minute: 0, days: [7] }]) {
    assert.throws(() => nextRun(s, new Date(), IL), RangeError, JSON.stringify(s));
  }
});
