import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E100.mjs";
const get = () => exportsOf(import.meta.url, FILE, ["summarizeLog"], "export");

const LOG = [
  "2026-11-19T08:30:00Z GET /tasks 200 13ms",
  "2026-11-19T08:30:01Z POST /tasks 201 40ms",
  "server started",
  "",
  "2026-11-19T08:30:02Z GET /tasks/99 404 2ms",
  "2026-11-19T08:30:03Z GET /tasks 200 120ms",
  "2026-11-19T08:30:04Z DELETE /tasks/7 200 120ms",
  "2026-11-19T08:30:05Z GET  /tasks 200 1ms",
].join("\n");

test("סיכום של לוג", async () => {
  const { summarizeLog } = await get();
  assert.deepEqual(summarizeLog(LOG), {
    total: 5,
    skipped: 2,
    byStatus: { 200: 3, 201: 1, 404: 1 },
    slowest: { path: "/tasks", ms: 120 },
  }, "שורה ריקה לא נספרת; שורה עם רווח כפול — skipped; בתיקו ב־ms — הראשונה");
});
test("\\r\\n", async () => {
  const { summarizeLog } = await get();
  const r = summarizeLog("2026-11-19T08:30:00Z GET /a 500 7ms\r\n2026-11-19T08:30:01Z PATCH /b 200 9ms\r\n");
  assert.deepEqual(r, { total: 2, skipped: 0, byStatus: { 200: 1, 500: 1 }, slowest: { path: "/b", ms: 9 } }, "שורות שנגמרות ב־\\r\\n — צריך split(/\\r?\\n/)");
});
test("ms ו־status מספרים, לא מחרוזות", async () => {
  const { summarizeLog } = await get();
  const r = summarizeLog("2026-11-19T08:30:00Z GET /a 200 9ms\n2026-11-19T08:30:01Z GET /b 200 10ms");
  assert.deepEqual(r.slowest, { path: "/b", ms: 10 }, "\"9\" > \"10\" כמחרוזות — צריך Number");
});
test("בלי שורות תקינות", async () => {
  const { summarizeLog } = await get();
  assert.deepEqual(summarizeLog(""), { total: 0, skipped: 0, byStatus: {}, slowest: null });
  assert.deepEqual(summarizeLog("oops\nGET /x"), { total: 0, skipped: 2, byStatus: {}, slowest: null });
});
