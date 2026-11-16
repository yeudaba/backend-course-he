import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { runToolCalls } = await load(import.meta.url, "P29.5-E34.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("במקביל, באותו סדר", async () => {
  const tools = {
    slow: { run: async (i) => (await wait(120), `slow:${i.n}`) },
    fast: { run: async (i) => (await wait(10), `fast:${i.n}`) },
  };
  const t0 = Date.now();
  const r = await runToolCalls([{ id: "a", name: "slow", input: { n: 1 } }, { id: "b", name: "fast", input: { n: 2 } }, { id: "c", name: "slow", input: { n: 3 } }], tools, { timeoutMs: 1000 });
  const ms = Date.now() - t0;
  assert.ok(ms < 230, `במקביל: ${ms}ms`);
  assert.deepEqual(r, [
    { type: "tool_result", tool_use_id: "a", content: "slow:1" },
    { type: "tool_result", tool_use_id: "b", content: "fast:2" },
    { type: "tool_result", tool_use_id: "c", content: "slow:3" },
  ]);
});
test("לא קיים, זורק, timeout", async () => {
  let finishedLate = false;
  const tools = {
    boom: { run: async () => { throw new Error("db down"); } },
    stuck: { run: async () => { await wait(400); finishedLate = true; return "late"; } },
    ok: { run: async () => "fine" },
  };
  const t0 = Date.now();
  const r = await runToolCalls(
    [{ id: "1", name: "nope", input: {} }, { id: "2", name: "toString", input: {} }, { id: "3", name: "boom", input: {} }, { id: "4", name: "stuck", input: {} }, { id: "5", name: "ok", input: {} }],
    tools,
    { timeoutMs: 80 },
  );
  const ms = Date.now() - t0;
  assert.ok(ms < 300, `לא מחכים לכלי התקוע (${ms}ms)`);
  assert.equal(finishedLate, false);
  assert.deepEqual(r, [
    { type: "tool_result", tool_use_id: "1", content: "unknown tool: nope", is_error: true },
    { type: "tool_result", tool_use_id: "2", content: "unknown tool: toString", is_error: true },
    { type: "tool_result", tool_use_id: "3", content: "שגיאה: db down", is_error: true },
    { type: "tool_result", tool_use_id: "4", content: "timeout after 80ms", is_error: true },
    { type: "tool_result", tool_use_id: "5", content: "fine" },
  ]);
  assert.deepEqual(await runToolCalls([], tools, { timeoutMs: 10 }), []);
});
test("timers של כלים שסיימו — מבוטלים", async () => {
  const before = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  await runToolCalls([{ id: "a", name: "ok", input: {} }], { ok: { run: async () => "x" } }, { timeoutMs: 60_000 });
  const after = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  assert.equal(after, before, "נשאר timer של דקה פתוח");
});
