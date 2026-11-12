import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E75.ts", ["parseCertDates", "certStatus"]);

test("parseCertDates", async () => {
  const { parseCertDates } = await get();
  const r = parseCertDates("notBefore=Nov  7 12:00:00 2026 GMT\nnotAfter=Feb  5 12:00:00 2027 GMT\n");
  assert.equal(r.notBefore.toISOString(), "2026-11-07T12:00:00.000Z");
  assert.equal(r.notAfter.toISOString(), "2027-02-05T12:00:00.000Z");
  const swapped = parseCertDates("notAfter=Dec 31 23:59:59 2026 GMT\nnotBefore=Oct  2 00:00:00 2026 GMT");
  assert.equal(swapped.notAfter.toISOString(), "2026-12-31T23:59:59.000Z", "סדר השורות לא משנה");
  for (const bad of ["", "notBefore=Nov  7 12:00:00 2026 GMT", "notBefore=x\nnotAfter=y", "foo=bar"]) {
    assert.throws(() => parseCertDates(bad), { message: "פלט לא תקין" }, JSON.stringify(bad));
  }
});
test("certStatus", async () => {
  const { certStatus } = await get();
  const after = new Date("2027-02-05T12:00:00Z");
  assert.deepEqual(certStatus(after, new Date("2026-12-01T00:00:00Z")), { daysLeft: 66, status: "ok" });
  assert.deepEqual(certStatus(after, new Date("2027-01-15T12:00:00Z")), { daysLeft: 21, status: "ok" }, "בדיוק 21 — עוד ok");
  assert.deepEqual(certStatus(after, new Date("2027-01-15T12:00:01Z")), { daysLeft: 20, status: "warn" });
  assert.deepEqual(certStatus(after, new Date("2027-02-05T00:00:00Z")), { daysLeft: 0, status: "warn" }, "חצי יום לפני");
  assert.deepEqual(certStatus(after, new Date("2027-02-05T12:00:00Z")), { daysLeft: 0, status: "expired" });
  assert.deepEqual(certStatus(after, new Date("2027-02-07T13:00:00Z")), { daysLeft: -3, status: "expired" });
  assert.deepEqual(certStatus(after, new Date("2027-01-01T12:00:00Z"), 40), { daysLeft: 35, status: "warn" }, "warnDays משלך");
});
