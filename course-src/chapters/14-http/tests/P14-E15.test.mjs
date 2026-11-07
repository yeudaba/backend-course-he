import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseHttpFile } = await load(import.meta.url, "P14-E15.mjs");

const file = `@base = http://localhost:4000
@token = abc

### רשימה
GET {{base}}/products

### יצירה
// הערה
POST {{base}}/products
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "מסך"
}

### ריק

###
DELETE {{base}}/products/1
`;

test("פירוק מלא", () => assert.deepEqual(parseHttpFile(file), [
  { name: "רשימה", method: "GET", url: "http://localhost:4000/products", headers: {}, body: undefined },
  { name: "יצירה", method: "POST", url: "http://localhost:4000/products", headers: { "Content-Type": "application/json", Authorization: "Bearer abc" }, body: '{\n  "name": "מסך"\n}' },
  { name: "", method: "DELETE", url: "http://localhost:4000/products/1", headers: {}, body: undefined },
]));
test("CRLF", () => assert.equal(parseHttpFile("@b = x\r\n### a\r\nGET {{b}}/y\r\n").at(0).url, "x/y"));
test("משתנה לא מוגדר", () => assert.throws(() => parseHttpFile("### a\nGET {{host}}/x"), { message: "משתנה לא מוגדר: host" }));
