import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E58.ts", ["profileSchema"])).profileSchema;

test("תקין", async () => {
  const s = await get();
  assert.deepEqual(s.parse({ timeZone: "Asia/Jerusalem" }), { timeZone: "Asia/Jerusalem" });
  assert.deepEqual(s.parse({ timeZone: "UTC", birthDate: "2004-02-29", reminderTime: "00:00" }), { timeZone: "UTC", birthDate: "2004-02-29", reminderTime: "00:00" });
  assert.equal(s.parse({ timeZone: "America/New_York", reminderTime: "23:59" }).reminderTime, "23:59");
  assert.equal(typeof s.parse({ timeZone: "UTC", birthDate: "1990-05-17" }).birthDate, "string", "בלי המרה ל־Date");
});
test("timeZone", async () => {
  const s = await get();
  const r = s.safeParse({ timeZone: "Mars/Olympus" });
  assert.equal(r.success, false);
  assert.equal(r.error.issues[0].message, "אזור זמן לא מוכר");
  for (const tz of ["", 42, null]) assert.equal(s.safeParse({ timeZone: tz }).success, false, JSON.stringify(tz));
  assert.equal(s.safeParse({}).success, false, "timeZone חובה");
});
test("birthDate ו־reminderTime", async () => {
  const s = await get();
  for (const b of ["2026-02-30", "1990-5-17", "17/05/1990", "1990-05-17T00:00:00Z"]) assert.equal(s.safeParse({ timeZone: "UTC", birthDate: b }).success, false, b);
  for (const t of ["9:00", "24:00", "12:60", "99:99", "12:5", "12:30:00", " 12:30"]) assert.equal(s.safeParse({ timeZone: "UTC", reminderTime: t }).success, false, t);
  for (const t of ["09:00", "19:45", "20:00"]) assert.equal(s.safeParse({ timeZone: "UTC", reminderTime: t }).success, true, t);
});
test("strict — שדה לא מוכר", async () => {
  const s = await get();
  assert.equal(s.safeParse({ timeZone: "UTC", role: "admin" }).success, false);
});
