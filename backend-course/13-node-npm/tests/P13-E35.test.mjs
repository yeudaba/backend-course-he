import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E35.mjs", ["addDependency"])).addDependency;
const snapshot = (o) => JSON.parse(JSON.stringify(o));

test("מוסיפה ל־dependencies עם ^, ממוין, בלי לשנות את המקור", async () => {
  const add = await get();
  const pkg = { name: "app", version: "1.0.0", dependencies: { zod: "^4.1.5", pg: "^8.0.0" } };
  const before = snapshot(pkg);
  const r = add(pkg, "express", "5.1.0");
  assert.deepEqual(r, { name: "app", version: "1.0.0", dependencies: { express: "^5.1.0", pg: "^8.0.0", zod: "^4.1.5" } });
  assert.deepEqual(Object.keys(r.dependencies), ["express", "pg", "zod"], "המפתחות צריכים להיות ממוינים");
  assert.deepEqual(pkg, before, "המקור השתנה — צור אובייקט חדש");
});
test("dev: true, ויצירת החלק אם חסר", async () => {
  const add = await get();
  const r = add({ name: "app" }, "eslint", "9.39.0", { dev: true });
  assert.deepEqual(r, { name: "app", devDependencies: { eslint: "^9.39.0" } });
  assert.deepEqual(add({ name: "a" }, "zod", "4.0.0"), { name: "a", dependencies: { zod: "^4.0.0" } });
});
test("מעבירה מהחלק השני, ומוחקת חלק שהתרוקן", async () => {
  const add = await get();
  const pkg = { dependencies: { zod: "^4.1.5" }, devDependencies: { express: "^4.0.0", eslint: "^9.0.0" } };
  const before = snapshot(pkg);
  assert.deepEqual(add(pkg, "express", "5.1.0"), { dependencies: { express: "^5.1.0", zod: "^4.1.5" }, devDependencies: { eslint: "^9.0.0" } });
  const r = add({ dependencies: { zod: "^4.1.5" } }, "zod", "4.2.0", { dev: true });
  assert.deepEqual(r, { devDependencies: { zod: "^4.2.0" } });
  assert.ok(!("dependencies" in r), "חלק שהתרוקן נמחק");
  assert.deepEqual(pkg, before, "המקור השתנה");
});
test("עדכון גרסה של חבילה קיימת, ומיון של scopes", async () => {
  const add = await get();
  assert.deepEqual(add({ dependencies: { zod: "^3.0.0" } }, "zod", "4.1.5"), { dependencies: { zod: "^4.1.5" } });
  const r = add({ devDependencies: { typescript: "^5" } }, "@types/node", "24.0.0", { dev: true });
  assert.deepEqual(Object.keys(r.devDependencies), ["@types/node", "typescript"]);
});
