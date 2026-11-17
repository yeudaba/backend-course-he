import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = async () => exportsOf(import.meta.url, "P14-E55.mjs", ["NotFoundError", "ConflictError", "ValidationError", "toApiError"]);

test("המחלקות", async () => {
  const { NotFoundError, ConflictError, ValidationError } = await mod();
  const v = new ValidationError("קלט לא תקין", ["a"]);
  assert.ok(v instanceof Error, "ValidationError צריכה לרשת מ־Error");
  assert.equal(v.message, "קלט לא תקין");
  assert.deepEqual(v.details, ["a"]);
  assert.ok(new NotFoundError("x") instanceof Error);
  assert.ok(new ConflictError("x") instanceof Error);
  assert.equal(new NotFoundError("לא נמצא").message, "לא נמצא");
});
test("שגיאות מוכרות", async () => {
  const { NotFoundError, ConflictError, ValidationError, toApiError } = await mod();
  assert.deepEqual(toApiError(new ValidationError("קלט לא תקין", ["price: חייב להיות מספר", "name: חובה"])), {
    status: 400,
    body: { error: { code: "VALIDATION", message: "קלט לא תקין", details: ["price: חייב להיות מספר", "name: חובה"] } },
  });
  assert.deepEqual(toApiError(new NotFoundError("המוצר לא נמצא")), { status: 404, body: { error: { code: "NOT_FOUND", message: "המוצר לא נמצא" } } });
  assert.deepEqual(toApiError(new ConflictError("האימייל תפוס")), { status: 409, body: { error: { code: "CONFLICT", message: "האימייל תפוס" } } });
});
test("JSON שבור", async () => {
  const { toApiError } = await mod();
  let err;
  try {
    JSON.parse("{oops");
  } catch (e) {
    err = e;
  }
  assert.deepEqual(toApiError(err), { status: 400, body: { error: { code: "INVALID_JSON", message: "JSON לא תקין" } } });
});
test("כל השאר ← 500 בלי לחשוף פרטים", async () => {
  const { toApiError } = await mod();
  const want = { status: 500, body: { error: { code: "INTERNAL", message: "שגיאה פנימית" } } };
  assert.deepEqual(toApiError(new Error("connect ECONNREFUSED 10.0.0.5:5432")), want, "ההודעה המקורית לא יוצאת ללקוח");
  assert.deepEqual(toApiError(new TypeError("Cannot read properties of undefined")), want);
  assert.deepEqual(toApiError("string thrown"), want);
});
