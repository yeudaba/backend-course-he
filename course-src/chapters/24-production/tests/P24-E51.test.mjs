import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E51.ts", ["toLocalIso"]);
const CASES = [
  ["2026-11-04T22:30:00Z", "Asia/Jerusalem", "2026-11-05T00:30:00+02:00"],
  ["2026-07-01T09:15:42.999Z", "Asia/Jerusalem", "2026-07-01T12:15:42+03:00"],
  ["2026-03-26T23:59:00Z", "Asia/Jerusalem", "2026-03-27T01:59:00+02:00"],
  ["2026-03-27T00:00:00Z", "Asia/Jerusalem", "2026-03-27T03:00:00+03:00"],
  ["2026-10-24T22:30:00Z", "Asia/Jerusalem", "2026-10-25T01:30:00+03:00"],
  ["2026-10-24T23:30:00Z", "Asia/Jerusalem", "2026-10-25T01:30:00+02:00"],
  ["2026-01-15T12:00:00Z", "America/New_York", "2026-01-15T07:00:00-05:00"],
  ["2026-01-15T03:00:00Z", "America/New_York", "2026-01-14T22:00:00-05:00"],
  ["2026-07-15T12:00:00Z", "America/New_York", "2026-07-15T08:00:00-04:00"],
  ["2026-01-15T12:00:00Z", "Asia/Kolkata", "2026-01-15T17:30:00+05:30"],
  ["2026-01-15T00:00:00Z", "UTC", "2026-01-15T00:00:00+00:00"],
  ["2026-06-30T22:00:00Z", "Asia/Jerusalem", "2026-07-01T01:00:00+03:00"],
  ["2026-12-31T22:00:00Z", "Asia/Jerusalem", "2027-01-01T00:00:00+02:00"],
];

test("פורמט ו־offset", async () => {
  const { toLocalIso } = await get();
  for (const [iso, tz, want] of CASES) assert.equal(toLocalIso(new Date(iso), tz), want, `${iso} ב־${tz}`);
});
test("הלוך ושוב — אותו רגע (בדיוק של שנייה)", async () => {
  const { toLocalIso } = await get();
  for (let t = Date.parse("2026-01-01T00:00:00Z"); t < Date.parse("2027-01-01T00:00:00Z"); t += 7 * 3600_000 + 123_456) {
    for (const tz of ["Asia/Jerusalem", "America/Los_Angeles", "Australia/Adelaide"]) {
      const s = toLocalIso(new Date(t), tz);
      assert.match(s, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, s);
      assert.equal(Date.parse(s), Math.floor(t / 1000) * 1000, `${new Date(t).toISOString()} ב־${tz} ← ${s}`);
    }
  }
});
