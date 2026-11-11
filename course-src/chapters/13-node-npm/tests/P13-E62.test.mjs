import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P13-E62.mjs", ["required", "optional"]);

test("required", async () => {
  const { required } = await get();
  assert.equal(required({ A: " x " }, "A"), "x");
  assert.equal(required({ A: "0" }, "A"), "0");
  for (const env of [{}, { A: "" }, { A: "   " }]) {
    assert.throws(() => required(env, "A"), { message: "חסר משתנה סביבה: A" }, JSON.stringify(env));
  }
});
test("optional", async () => {
  const { optional } = await get();
  assert.equal(optional({ L: " debug " }, "L", "info"), "debug");
  assert.equal(optional({}, "L", "info"), "info");
  assert.equal(optional({ L: "  " }, "L", "info"), "info");
  assert.equal(optional({ L: "false" }, "L", "x"), "false");
  assert.equal(optional({}, "L", undefined), undefined);
});
