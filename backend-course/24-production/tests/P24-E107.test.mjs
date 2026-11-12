import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, code } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E107.ts", ["overdueByUser"])).overdueByUser;

test("00:30 בישראל, ערב בניו יורק", async (t) => {
  const f = await get();
  const db = await sandbox(t, import.meta.url, "tz-tasks.sql");
  assert.deepEqual(await f(db.pool(2), new Date("2026-11-04T22:30:00Z")), [
    { userId: 1, overdue: 2 },
    { userId: 2, overdue: 1 },
    { userId: 3, overdue: 1 },
    { userId: 4, overdue: 0 },
  ]);
});
test("בוקר — גם בניו יורק כבר 5.11", async (t) => {
  const f = await get();
  const db = await sandbox(t, import.meta.url, "tz-tasks.sql");
  assert.deepEqual(await f(db.pool(2), new Date("2026-11-05T05:00:00Z")), [
    { userId: 1, overdue: 2 },
    { userId: 2, overdue: 2 },
    { userId: 3, overdue: 2 },
    { userId: 4, overdue: 0 },
  ]);
});
test("now מהפרמטר, לא מהמסד", async (t) => {
  const f = await get();
  const db = await sandbox(t, import.meta.url, "tz-tasks.sql");
  const r = await f(db.pool(2), new Date("2026-01-01T00:00:00Z"));
  assert.deepEqual(r.map((x) => x.overdue), [0, 0, 0, 0], "ב־1.1.2026 אף משימה עוד לא באיחור");
  assert.doesNotMatch(code(import.meta.url, "P24-E107.ts"), /CURRENT_DATE|now\(\)/i, "בלי CURRENT_DATE / now() של המסד");
});
