import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { AppError, NotFoundError, ValidationError, ConflictError, toHttp } = await load(import.meta.url, "P12-E09.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E09.ts"); assert.ok(r.ok, r.output); });
test("מחלקות", () => {
  const nf = new NotFoundError("משתמש", 3);
  assert.ok(nf instanceof AppError && nf instanceof Error);
  assert.equal(nf.message, "משתמש 3 לא נמצא"); assert.equal(nf.status, 404); assert.equal(nf.code, "NOT_FOUND"); assert.equal(nf.name, "NotFoundError");
  const v = new ValidationError("email", "לא תקין"); assert.equal(v.status, 400); assert.equal(v.field, "email"); assert.equal(v.name, "ValidationError");
  assert.equal(new ConflictError("x").status, 409);
});
test("toHttp", () => {
  assert.deepEqual(toHttp(new ValidationError("email", "לא תקין")), { status: 400, body: { code: "VALIDATION", message: "לא תקין", field: "email" } });
  assert.deepEqual(toHttp(new ConflictError("תפוס")), { status: 409, body: { code: "CONFLICT", message: "תפוס" } });
  assert.deepEqual(toHttp(new TypeError("x")), { status: 500, body: { code: "INTERNAL", message: "שגיאה פנימית" } });
});
