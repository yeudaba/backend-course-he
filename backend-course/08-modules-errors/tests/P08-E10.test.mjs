import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { attempt, firstSuccessful } = await load(import.meta.url, "P08-E10.js");

test("attempt הצלחה", () => assert.deepEqual(attempt(() => 5), { ok: true, value: 5 }));
test("attempt כישלון", () => assert.deepEqual(attempt(() => { throw new Error("x"); }), { ok: false, error: "x" }));
test("firstSuccessful", () => {
  const fail = () => { throw new Error("no"); };
  assert.equal(firstSuccessful([fail, () => "B", () => "C"]), "B");
  assert.throws(() => firstSuccessful([fail, fail]), { message: "כל הניסיונות נכשלו" });
});
