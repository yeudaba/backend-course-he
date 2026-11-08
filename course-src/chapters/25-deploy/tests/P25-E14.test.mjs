import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { expandMatrix } = await load(import.meta.url, "P25-E14.ts");

test("מכפלה של צירים, לפי הסדר", () => {
  assert.deepEqual(expandMatrix({ node: [22, 24], os: ["ubuntu-latest", "macos-latest"] }), [
    { node: 22, os: "ubuntu-latest" }, { node: 22, os: "macos-latest" },
    { node: 24, os: "ubuntu-latest" }, { node: 24, os: "macos-latest" },
  ]);
  assert.deepEqual(expandMatrix({ node: [24] }), [{ node: 24 }]);
});
test("exclude", () => {
  assert.deepEqual(expandMatrix({ node: [22, 24], os: ["ubuntu-latest", "macos-latest"], exclude: [{ node: 22, os: "macos-latest" }] }).length, 3);
  assert.deepEqual(expandMatrix({ node: [22, 24], os: ["a", "b"], exclude: [{ os: "b" }] }), [{ node: 22, os: "a" }, { node: 24, os: "a" }], "exclude חלקי — כל מה שמתאים");
});
test("include: מוסיף שדה לשילוב קיים", () => {
  assert.deepEqual(expandMatrix({ node: [22, 24], include: [{ node: 24, coverage: true }] }), [{ node: 22 }, { node: 24, coverage: true }]);
});
test("include: שילוב חדש", () => {
  assert.deepEqual(expandMatrix({ node: [22, 24], include: [{ node: 25, experimental: true }] }), [{ node: 22 }, { node: 24 }, { node: 25, experimental: true }]);
  assert.deepEqual(expandMatrix({ include: [{ name: "lint" }, { name: "test" }] }), [{ name: "lint" }, { name: "test" }], "רק include");
});
test("include אחרי exclude", () => {
  assert.deepEqual(expandMatrix({ node: [22, 24], exclude: [{ node: 22 }], include: [{ node: 22, legacy: true }] }), [{ node: 24 }, { node: 22, legacy: true }]);
});
