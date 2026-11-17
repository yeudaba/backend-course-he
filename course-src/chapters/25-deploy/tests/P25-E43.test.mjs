import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E43.ts", ["ciReadiness"])).ciReadiness;
const good = {
  scripts: { test: "jest", typecheck: "tsc --noEmit", build: "tsc -p tsconfig.build.json", "test:int": "jest --runInBand" },
  engines: { node: ">=24" },
  devDependencies: { typescript: "^6.0.0" },
};

test("תקין", async () => {
  const f = await get();
  assert.deepEqual(f(good), []);
  assert.deepEqual(f({ ...good, devDependencies: {}, dependencies: { typescript: "^6.0.0" } }), [], "typescript ב־dependencies — גם בסדר");
});
test("כל הבעיות, בסדר", async () => {
  const f = await get();
  assert.deepEqual(f({}), ["missing script: test", "missing script: typecheck", "missing script: build", "engines.node is missing"]);
  assert.deepEqual(f({ scripts: { test: "jest --watch", typecheck: "tsc", build: "tsc" }, engines: {} }), [
    "test runs in watch mode",
    "typecheck should not emit",
    "typescript is not installed",
    "engines.node is missing",
  ]);
});
test("tsc כמילה שלמה", async () => {
  const f = await get();
  const pkg = { scripts: { test: "node --test", typecheck: "node scripts/tsconfig-check.js", build: "vite build" }, engines: { node: "24" } };
  assert.deepEqual(f(pkg), [], "tsconfig-check הוא לא tsc");
  assert.deepEqual(f({ ...pkg, scripts: { ...pkg.scripts, build: "npx tsc -p ." } }), ["typescript is not installed"]);
});
