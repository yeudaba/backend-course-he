import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E36.mjs", ["outdated"])).outdated;

test("הדוגמה מהמשימה", async () => {
  const outdated = await get();
  assert.deepEqual(outdated({ express: "^4.18.2", zod: "~4.1.5", pg: "8.16.0" }, { express: "5.1.0", zod: "4.1.12", pg: "8.16.0" }), [
    { name: "express", current: "4.18.2", latest: "5.1.0", type: "major" },
    { name: "zod", current: "4.1.5", latest: "4.1.12", type: "patch" },
  ]);
});
test("minor, השוואה מספרית, וחבילות בלי latest", async () => {
  const outdated = await get();
  assert.deepEqual(outdated({ b: "^1.9.0", a: "1.2.3", c: "^2.0.0" }, { a: "1.10.0", b: "1.10.0" }), [
    { name: "a", current: "1.2.3", latest: "1.10.0", type: "minor" },
    { name: "b", current: "1.9.0", latest: "1.10.0", type: "minor" },
  ]);
});
test("גרסה מקומית חדשה יותר — לא outdated", async () => {
  const outdated = await get();
  assert.deepEqual(outdated({ x: "^2.0.0", y: "1.5.0", z: "~3.3.10" }, { x: "1.9.9", y: "1.4.99", z: "3.3.9" }), []);
  assert.deepEqual(outdated({}, { x: "1.0.0" }), []);
});
