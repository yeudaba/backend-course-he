import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { HttpError, NotFoundError, ForbiddenError, respond } = await load(import.meta.url, "P12-E21.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E21.ts"); assert.ok(r.ok, r.output); });
test("name והודעה", () => { const e = new NotFoundError("x"); assert.equal(e.name, "NotFoundError"); assert.equal(e.message, "x"); assert.equal(e.status, 404); });
test("respond", () => {
  assert.equal(respond(new ForbiddenError()), "403 אין הרשאה");
  assert.equal(respond(new NotFoundError("הזמנה לא נמצאה")), "404 הזמנה לא נמצאה");
  assert.equal(respond(new HttpError("עמוס", 503)), "503 עמוס");
  assert.equal(respond(new Error("x")), "500 שגיאה פנימית");
});
