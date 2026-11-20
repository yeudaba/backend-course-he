import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E83.mjs", ["checkRequest"])).checkRequest;
const B = "http://localhost:4000";

test("נתיב לא מוכר ← 404", async () => {
  const check = await get();
  for (const p of ["/", "/orders", "/products/7/reviews", "/product"]) assert.equal(check("GET", B + p), 404, `GET ${p}`);
});
test("method לא מתאים ← 405", async () => {
  const check = await get();
  assert.equal(check("PUT", B + "/products"), 405, "PUT /products — הנתיב קיים, ה־method לא");
  assert.equal(check("DELETE", B + "/products"), 405);
  assert.equal(check("POST", B + "/products/7"), 405);
});
test("maxPrice לא תקין ← 400", async () => {
  const check = await get();
  for (const v of ["abc", "-1", "", "-0.5", "12abc"]) assert.equal(check("GET", `${B}/products?maxPrice=${v}`), 400, `maxPrice=${v}`);
});
test("maxPrice תקין", async () => {
  const check = await get();
  for (const v of ["0", "50", "12.5"]) assert.equal(check("GET", `${B}/products?maxPrice=${v}`), 200, `maxPrice=${v}`);
  assert.equal(check("GET", `${B}/products?category=coffee`), 200);
});
test("201, 204, 200", async () => {
  const check = await get();
  assert.equal(check("POST", B + "/products"), 201, "POST שיוצר ← 201 Created");
  assert.equal(check("DELETE", B + "/products/7"), 204);
  assert.equal(check("GET", B + "/products/7"), 200);
  assert.equal(check("GET", B + "/products"), 200);
});
