import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E80.mjs", ["groupByPriority"])).groupByPriority;
const ids = (m) => [...m].map(([k, list]) => [k, list.map((t) => t.id)]);
test("סדר הקבוצות ובתוכן", async () => {
  const f = await get();
  const tasks = [
    { id: 1, priority: "low", status: "todo", dueDate: null },
    { id: 2, priority: "high", status: "done", dueDate: "2026-11-01" },
    { id: 3, priority: "high", status: "todo", dueDate: "2026-11-20" },
    { id: 4, priority: "high", status: "todo", dueDate: "2026-11-05" },
    { id: 5, priority: "urgent", status: "todo", dueDate: null },
    { id: 6, priority: "high", status: "todo", dueDate: null },
    { id: 7, priority: "high", status: "todo", dueDate: "2026-11-05" },
    { id: 8, priority: "low", status: "done", dueDate: null },
    { id: 9, priority: "low", status: "todo", dueDate: "2026-12-01" },
  ];
  const copy = structuredClone(tasks);
  const m = f(tasks);
  assert.ok(m instanceof Map, "מחזירה Map");
  assert.deepEqual(ids(m), [["high", [4, 7, 3, 6, 2]], ["low", [9, 1, 8]], ["other", [5]]]);
  assert.deepEqual(tasks, copy, "המערך המקורי לא השתנה");
});
test("רק קבוצות לא ריקות, ו־other", async () => {
  const f = await get();
  assert.deepEqual(ids(f([{ id: 1, priority: "medium", status: "todo", dueDate: null }])), [["medium", [1]]]);
  assert.deepEqual(ids(f([])), []);
  assert.deepEqual(ids(f([{ id: 2, priority: undefined, status: "todo", dueDate: null }, { id: 1, priority: "low", status: "todo", dueDate: null }])), [["low", [1]], ["other", [2]]]);
});
