import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E84.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseLogLine"]);

test("שורה תקינה", async () => {
  const { parseLogLine } = await get();
  assert.deepEqual(parseLogLine("2026-11-19T08:30:00Z GET /tasks/42 200 13ms"), { time: "2026-11-19T08:30:00Z", method: "GET", path: "/tasks/42", status: 200, ms: 13 });
  assert.deepEqual(parseLogLine("2026-11-19T08:30:01Z DELETE /tasks/7 404 2ms"), { time: "2026-11-19T08:30:01Z", method: "DELETE", path: "/tasks/7", status: 404, ms: 2 });
  assert.deepEqual(parseLogLine("2026-11-19T09:00:00Z PATCH /tasks/7?x=1 500 1200ms"), { time: "2026-11-19T09:00:00Z", method: "PATCH", path: "/tasks/7?x=1", status: 500, ms: 1200 });
  assert.deepEqual(parseLogLine("t POST / 201 0ms"), { time: "t", method: "POST", path: "/", status: 201, ms: 0 });
});
test("status ו־ms הם מספרים", async () => {
  const { parseLogLine } = await get();
  const r = parseLogLine("2026-11-19T08:30:00Z PUT /a 204 7ms");
  assert.equal(typeof r.status, "number", "status צריך להיות מספר (Number)");
  assert.equal(typeof r.ms, "number", "ms צריך להיות מספר (Number)");
});
test("שורה שלא בפורמט ← null", async () => {
  const { parseLogLine } = await get();
  for (const bad of [
    "server started",
    "",
    "2026-11-19T08:30:00Z GET  /tasks 200 13ms",
    "2026-11-19T08:30:00Z GET /tasks 200 13ms ",
    "2026-11-19T08:30:00Z FETCH /tasks 200 13ms",
    "2026-11-19T08:30:00Z get /tasks 200 13ms",
    "2026-11-19T08:30:00Z GET tasks 200 13ms",
    "2026-11-19T08:30:00Z GET /tasks 20 13ms",
    "2026-11-19T08:30:00Z GET /tasks 200 13",
    "2026-11-19T08:30:00Z GET /tasks 200 13ms extra",
  ]) {
    assert.equal(parseLogLine(bad), null, `"${bad}" צריך להחזיר null`);
  }
});
