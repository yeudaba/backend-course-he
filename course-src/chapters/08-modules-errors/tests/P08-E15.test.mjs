import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { retry } = await load(import.meta.url, "P08-E15.js");

test("מצליח בניסיון השלישי", () => {
  const calls = [];
  const r = retry((n) => { calls.push(n); if (n < 3) throw new Error(`fail ${n}`); return "ok"; }, 5);
  assert.equal(r, "ok");
  assert.deepEqual(calls, [1, 2, 3]);
});
test("כולם נכשלו — זורק את השגיאה האחרונה", () => assert.throws(() => retry((n) => { throw new Error(`fail ${n}`); }, 2), { message: "fail 2" }));
test("מצליח מיד", () => assert.equal(retry(() => 7, 3), 7));
