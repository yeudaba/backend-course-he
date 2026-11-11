import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E42.mjs", ["byScope"])).byScope;

test("הדוגמה מהמשימה", async () => {
  const byScope = await get();
  const m = byScope({ dependencies: { express: "^5", "@prisma/client": "^6" }, devDependencies: { "@types/node": "^24", "@types/express": "^5", eslint: "^9" } });
  assert.ok(m instanceof Map, "צריך להחזיר Map");
  assert.deepEqual([...m], [["(ללא)", ["eslint", "express"]], ["@prisma", ["@prisma/client"]], ["@types", ["@types/express", "@types/node"]]]);
});
test("בלי חבילות ללא scope, חלק חסר, וכפילות בין החלקים", async () => {
  const byScope = await get();
  assert.deepEqual([...byScope({ devDependencies: { "@z/a": "1", "@b/c": "1", "@b/a": "1" } })], [["@b", ["@b/a", "@b/c"]], ["@z", ["@z/a"]]]);
  assert.deepEqual([...byScope({ dependencies: { zod: "1" }, devDependencies: { zod: "2" } })], [["(ללא)", ["zod"]]]);
  assert.equal(byScope({}).size, 0);
});
