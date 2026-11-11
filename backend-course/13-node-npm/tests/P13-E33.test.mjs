import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E33.mjs", ["isValidPackageName"])).isValidPackageName;

test("שמות תקינים", async () => {
  const f = await get();
  for (const n of ["express", "lodash.merge", "a", "node-fetch", "my_pkg", "9lives", "@types/node", "@prisma/client", "@a-b/c.d", "x".repeat(214)]) {
    assert.equal(f(n), true, `${n.slice(0, 30)} צריך להיות תקין`);
  }
});
test("שמות לא תקינים", async () => {
  const f = await get();
  for (const n of ["", "My-Package", ".hidden", "_private", "a b", "שלום", "a/b", "@scope", "@a/b/c", "@/x", "@_a/b", "@a/.b", "x".repeat(215), "a!", "@types/Node"]) {
    assert.equal(f(n), false, `${JSON.stringify(n.slice(0, 30))} צריך להיות לא תקין`);
  }
});
