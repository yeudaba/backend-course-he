import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { depsReport, scriptLines, readPackage } = await load(import.meta.url, "P13-E07.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("depsReport", () => { assert.deepEqual(depsReport({ dependencies: { zod: "1", express: "1" }, devDependencies: { eslint: "1" } }), { prod: ["express", "zod"], dev: ["eslint"], total: 3 }); assert.deepEqual(depsReport({}), { prod: [], dev: [], total: 0 }); });
test("scriptLines", () => assert.deepEqual(scriptLines({ scripts: { start: "node a", test: "node --test", dev: "node --watch a" } }), ["npm start  →  node a", "npm test  →  node --test", "npm run dev  →  node --watch a"]));
test("readPackage", async () => {
  const d = tmpdir(); fs.writeFileSync(path.join(d, "package.json"), '{"name":"x"}');
  assert.deepEqual(await readPackage(d), { name: "x" });
  await assert.rejects(readPackage(tmpdir()), { message: "לא נמצא package.json" });
  const bad = tmpdir(); fs.writeFileSync(path.join(bad, "package.json"), "{oops");
  await assert.rejects(readPackage(bad), SyntaxError);
});
