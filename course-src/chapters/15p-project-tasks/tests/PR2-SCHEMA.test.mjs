import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createTaskSchema, updateTaskSchema, listQuerySchema, idParamsSchema } = await load(import.meta.url, "tasks-api/src/tasks/tasks.schema.ts");
const fails = (schema, input) => assert.equal(schema.safeParse(input).success, false, `היה צריך להיכשל: ${JSON.stringify(input)}`);

test("createTaskSchema — ברירות מחדל וניקוי", () => {
  assert.deepEqual(createTaskSchema.parse({ title: "  ללמוד  " }), { title: "ללמוד", description: null, status: "todo", priority: "medium", dueDate: null });
  assert.deepEqual(
    createTaskSchema.parse({ title: "א", description: " פירוט ", status: "in_progress", priority: "high", dueDate: "2026-12-31", isAdmin: true }),
    { title: "א", description: "פירוט", status: "in_progress", priority: "high", dueDate: "2026-12-31" }
  );
});
test("createTaskSchema — שגיאות", () => {
  for (const input of [{}, { title: "" }, { title: "   " }, { title: "x".repeat(121) }, { title: "a", status: "open" }, { title: "a", priority: "urgent" }, { title: "a", dueDate: "31/12/2026" }, { title: "a", dueDate: "2026-02-30" }, { title: "a", description: "x".repeat(2001) }]) fails(createTaskSchema, input);
});
test("updateTaskSchema", () => {
  assert.deepEqual(updateTaskSchema.parse({ status: "done" }), { status: "done" });
  assert.deepEqual(updateTaskSchema.parse({ dueDate: null, description: null }), { dueDate: null, description: null });
  for (const input of [{}, { id: 5 }, { status: "done", owner: "x" }, { title: "" }, { priority: "urgent" }]) fails(updateTaskSchema, input);
});
test("listQuerySchema", () => {
  assert.deepEqual(listQuerySchema.parse({}), { sort: "-createdAt", page: 1, limit: 20 });
  assert.deepEqual(listQuerySchema.parse({ status: "done", priority: "low", q: " חלב ", sort: "dueDate", page: "2", limit: "50" }), { status: "done", priority: "low", q: "חלב", sort: "dueDate", page: 2, limit: 50 });
  for (const input of [{ page: "0" }, { limit: "51" }, { sort: "title" }, { status: "open" }, { page: "x" }]) fails(listQuerySchema, input);
});
test("idParamsSchema", () => {
  assert.deepEqual(idParamsSchema.parse({ id: "7" }), { id: 7 });
  for (const id of ["0", "-1", "1.5", "abc"]) fails(idParamsSchema, { id });
});
