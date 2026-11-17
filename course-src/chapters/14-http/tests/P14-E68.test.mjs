import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E68.mjs", ["lintHttpFile"])).lintHttpFile;

test("קובץ תקין ← []", async () => {
  const f = await get();
  const ok = `@base = http://localhost:4000
@token = abc

### כל המוצרים
# הערה
GET {{base}}/products
Accept: application/json

### מוצר חדש
POST {{base}}/products
content-type: application/json
Authorization: Bearer {{token}}

{"name":"מסך"}
`;
  assert.deepEqual(f(ok), []);
});
test("משתנה שלא הוגדר", async () => {
  const f = await get();
  assert.deepEqual(f("### a\nGET {{base}}/x?t={{token}}\n\n### b\nGET {{base}}/y\n\n### משתנים\n@token = 1\n"), ["שורה 2: המשתנה base לא הוגדר", "שורה 5: המשתנה base לא הוגדר"]);
});
test("header לא תקין וגוף בלי Content-Type", async () => {
  const f = await get();
  const broken = `@base = http://localhost:4000

### מוצר חדש
POST {{base}}/products
Content-Type: application/json
{
oops

### בלי Content-Type
// הערה לפני הבקשה
POST {{baseUrl}}/notes
Accept: */*

{"text":"שלום"}
### עוד אחד
PUT {{base}}/a
X Bad: 1

x`;
  assert.deepEqual(f(broken), [
    "שורה 6: header לא תקין",
    "שורה 7: header לא תקין",
    "שורה 11: המשתנה baseUrl לא הוגדר",
    "שורה 11: יש גוף בלי Content-Type",
    "שורה 16: יש גוף בלי Content-Type",
    "שורה 17: header לא תקין",
  ]);
});
test("בקשה בלי גוף ובלי Content-Type — בסדר", async () => {
  const f = await get();
  assert.deepEqual(f("### a\nDELETE http://x/1\n\n\n### b\nGET http://x/2"), []);
});
