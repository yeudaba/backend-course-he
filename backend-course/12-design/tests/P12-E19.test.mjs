import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { parsePagination, ValidationError } = await load(import.meta.url, "P12-E19.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E19.ts"); assert.ok(r.ok, r.output); });
test("ברירות מחדל וחישוב", () => { assert.deepEqual(parsePagination({}), { page: 1, pageSize: 20, offset: 0 }); assert.deepEqual(parsePagination({ page: "3", pageSize: "10" }), { page: 3, pageSize: 10, offset: 20 }); });
test("לא תקין", () => {
  for (const page of ["0", "-1", "abc", "1.5", "1e2", ""]) assert.throws(() => parsePagination({ page }), { field: "page", message: "page חייב להיות מספר שלם חיובי" });
  for (const pageSize of ["0", "101", "x"]) assert.throws(() => parsePagination({ pageSize }), { field: "pageSize", message: "pageSize חייב להיות בין 1 ל־100" });
});
