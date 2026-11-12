import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E94.ts", ["classifyTestFiles"])).classifyTestFiles;

test("פרויקט תקין", async () => {
  const classify = await get();
  const r = classify(["test/tasks.int-spec.ts", "src/tasks/tasks.service.spec.ts", "test/app.e2e-spec.ts", "src/auth/auth.service.spec.ts", "test/helpers.ts", "src/auth/auth.schema.spec.ts", "src/main.ts", "README.md"]);
  assert.deepEqual(r, {
    unit: ["src/auth/auth.schema.spec.ts", "src/auth/auth.service.spec.ts", "src/tasks/tasks.service.spec.ts"],
    e2e: ["test/app.e2e-spec.ts"],
    int: ["test/tasks.int-spec.ts"],
    problems: [],
  });
});
test("מה לא נספר", async () => {
  const classify = await get();
  const r = classify(["src/a.test.ts", "test/users.spec.ts", "src/x.e2e-spec.ts", "src/y.int-spec.ts", "specs/helpers.ts", "test/a.e2e-spec.js", "lib/src/b.spec.ts", "src\\tasks\\t.spec.ts"]);
  assert.deepEqual(r.unit, ["src/tasks/t.spec.ts"], "רק src/**.spec.ts, ו־\\ הופך ל־/");
  assert.deepEqual(r.e2e, []);
  assert.deepEqual(r.int, []);
  assert.deepEqual(r.problems, ["צריך לפחות 2 קובצי unit (יש 1)", "צריך לפחות קובץ e2e אחד", "צריך לפחות קובץ integration אחד"]);
});
test("ריק", async () => {
  const classify = await get();
  assert.deepEqual(classify([]).problems, ["צריך לפחות 2 קובצי unit (יש 0)", "צריך לפחות קובץ e2e אחד", "צריך לפחות קובץ integration אחד"]);
  assert.deepEqual(classify(["src/a.spec.ts", "src/b.spec.ts", "test/c.e2e-spec.ts"]).problems, ["צריך לפחות קובץ integration אחד"]);
});
