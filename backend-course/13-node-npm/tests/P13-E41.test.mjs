import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E41.mjs", ["projectInfo"])).projectInfo;
const dirWith = (text) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p13-e41-t-"));
  if (text !== undefined) fs.writeFileSync(path.join(dir, "package.json"), text);
  return dir;
};

test("פרויקט מלא", async () => {
  const projectInfo = await get();
  const dir = dirWith(JSON.stringify({ name: "shop", version: "2.1.0", scripts: { dev: "a", start: "b", test: "c" }, dependencies: { zod: "^4", pg: "^8" }, devDependencies: { eslint: "^9" } }));
  assert.deepEqual(await projectInfo(dir), { name: "shop", version: "2.1.0", scripts: ["dev", "start", "test"], deps: 2, devDeps: 1 });
});
test("חלקים חסרים", async () => {
  const projectInfo = await get();
  assert.deepEqual(await projectInfo(dirWith('{"name": "tiny"}')), { name: "tiny", version: "0.0.0", scripts: [], deps: 0, devDeps: 0 });
});
test("אין קובץ / JSON לא תקין", async () => {
  const projectInfo = await get();
  const empty = dirWith();
  await assert.rejects(projectInfo(empty), { message: `אין package.json ב־${empty}` });
  await assert.rejects(projectInfo(dirWith("{name: x}")), { message: "package.json לא תקין" });
});
test("שגיאה אחרת עוברת כמו שהיא", async () => {
  const projectInfo = await get();
  const dir = dirWith();
  fs.mkdirSync(path.join(dir, "package.json"));
  await assert.rejects(projectInfo(dir), (e) => e.code === "EISDIR", "תיקייה בשם package.json — השגיאה המקורית (EISDIR) צריכה לעבור");
});
