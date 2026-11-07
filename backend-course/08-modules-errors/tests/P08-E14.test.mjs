import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toHttpResponse } = await load(import.meta.url, "P08-E14.js");

test("שגיאת 4xx", () => { const e = new Error("לא נמצא"); e.status = 404; assert.deepEqual(toHttpResponse(e), { status: 404, body: { error: "לא נמצא" } }); });
test("SyntaxError", () => assert.deepEqual(toHttpResponse(new SyntaxError("Unexpected token")), { status: 400, body: { error: "בקשה לא תקינה" } }));
test("שגיאה כללית — בלי לחשוף פרטים", () => {
  assert.deepEqual(toHttpResponse(new TypeError("Cannot read properties of null")), { status: 500, body: { error: "שגיאה פנימית" } });
  const e = new Error("x"); e.status = 200;
  assert.equal(toHttpResponse(e).status, 500);
  assert.equal(toHttpResponse("לא Error").status, 500);
  assert.equal(toHttpResponse(undefined).status, 500);
});
