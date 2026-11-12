import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E43.ts", ["requestStory", "requestIdsForUser"]);
const j = (o) => JSON.stringify(o);
const LOG = [
  j({ time: "2026-11-07T15:30:24.134Z", level: "warn", msg: "request", requestId: "t-4512", userId: 1, method: "GET", path: "/tasks/999", status: 404, durationMs: 6 }),
  "Error: connect ECONNREFUSED 127.0.0.1:5432",
  j({ time: "2026-11-07T15:31:02.503Z", level: "error", msg: "request", requestId: "9d1e", userId: 3, method: "POST", path: "/tasks", status: 500, durationMs: 31 }),
  j({ time: "2026-11-07T15:31:02.480Z", level: "debug", msg: "db query", requestId: "9d1e" }),
  "null",
  "[1,2]",
  "",
  j({ time: "2026-11-07T15:31:02.501Z", level: "error", msg: "connect ECONNREFUSED", requestId: "9d1e" }),
  j({ time: "2026-11-07T15:31:02.501Z", level: "error", msg: "retry failed", requestId: "9d1e" }),
  j({ time: "2026-11-07T15:32:00.000Z", level: "info", msg: "request", requestId: "b7", userId: 3, method: "GET", path: "/tasks", status: 200, durationMs: 4 }),
  j({ time: "2026-11-07T15:33:00.000Z", level: "info", msg: "request", requestId: "c8", userId: "1", method: "GET", path: "/x", status: 200, durationMs: 4 }),
];

test("events — רק הבקשה, לפי time, ובתיקו לפי הסדר בקובץ", async () => {
  const { requestStory } = await get();
  const { events, summary } = requestStory(LOG, "9d1e");
  assert.deepEqual(events.map((e) => e.msg), ["db query", "connect ECONNREFUSED", "retry failed", "request"]);
  assert.equal(summary, "POST /tasks → 500 (31ms)");
});
test("summary", async () => {
  const { requestStory } = await get();
  assert.equal(requestStory(LOG, "t-4512").summary, "GET /tasks/999 → 404 (6ms)");
  const onlyError = [j({ time: "2026-11-07T10:00:00.000Z", msg: "boom", requestId: "z" })];
  assert.deepEqual(requestStory(onlyError, "z"), { events: [{ time: "2026-11-07T10:00:00.000Z", msg: "boom", requestId: "z" }], summary: null });
  assert.deepEqual(requestStory(LOG, "nope"), { events: [], summary: null });
  assert.deepEqual(requestStory([], "x"), { events: [], summary: null });
});
test("שורות לא תקינות לא מפילות", async () => {
  const { requestStory } = await get();
  assert.doesNotThrow(() => requestStory(["null", "42", "\"str\"", "{bad", "[]"], "x"));
});
test("requestIdsForUser", async () => {
  const { requestIdsForUser } = await get();
  assert.deepEqual(requestIdsForUser(LOG, 3), ["9d1e", "b7"]);
  assert.deepEqual(requestIdsForUser(LOG, 1), ["t-4512"], "userId \"1\" (מחרוזת) — לא אותו משתמש");
  assert.deepEqual(requestIdsForUser(LOG, 99), []);
  const dup = [j({ requestId: "a", userId: 5 }), j({ requestId: "b", userId: 5 }), j({ requestId: "a", userId: 5 })];
  assert.deepEqual(requestIdsForUser(dup, 5), ["a", "b"]);
});
