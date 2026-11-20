import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSameRows } from "../../tools/rows.mjs";
import { sandbox } from "../../tools/sql.mjs";

test("P30-E118: אחוז תגובה לפי ערוץ", async (t) => {
  const db = await sandbox(t, import.meta.url, "applications.sql");
  const got = await db.fileRows("P30-E118.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), ["channel", "applications", "responses", "interviews", "response_pct"], "שמות העמודות והסדר שלהן");
  assertSameRows(got, [
    { channel: "referral", applications: 4, responses: 3, interviews: 2, response_pct: 75 },
    { channel: "community", applications: 2, responses: 1, interviews: 0, response_pct: 50 },
    { channel: "company_site", applications: 4, responses: 2, interviews: 1, response_pct: 50 },
    { channel: "linkedin", applications: 8, responses: 2, interviews: 0, response_pct: 25 },
  ]);
  assertSameRows(got, await db.expectedRows("P30-E118.sql"));
});
test("P30-E118: נתונים אחרים", async (t) => {
  const db = await sandbox(t, import.meta.url, "applications.sql");
  await db.query("INSERT INTO applications (company, channel, applied_on, stage) VALUES ('Z1', 'community', '2026-11-01', 'offer'), ('Z2', 'linkedin', '2026-11-01', 'applied'), ('Z3', 'linkedin', '2026-11-02', 'applied')");
  const got = await db.fileRows("P30-E118.sql");
  assert.deepEqual(got.map((r) => [r.channel, r.response_pct]), [["referral", 75], ["community", 66.7], ["company_site", 50], ["linkedin", 20]]);
});
