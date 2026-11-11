import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E34.mjs", ["pathSegments"])).pathSegments;

test("נתיבים וכתובות", async () => {
  const f = await get();
  const cases = [
    ["https://shop.co.il/v2/orders/17?page=2", ["v2", "orders", "17"]],
    ["/products/7", ["products", "7"]],
    ["/a//b/", ["a", "b"]],
    ["/", []],
    ["http://localhost:3000", []],
    ["/users?x=/a/b", ["users"]],
  ];
  for (const [input, want] of cases) assert.deepEqual(f(input), want, `pathSegments("${input}")`);
});
test("פענוח — אחרי הפירוק", async () => {
  const f = await get();
  assert.deepEqual(f("/%D7%A1%D7%9C/7"), ["סל", "7"], "צריך לפענח כל חלק עם decodeURIComponent");
  assert.deepEqual(f("/files/a%2Fb"), ["files", "a/b"], "‏%2F הוא חלק מהשם — מפרקים לפי / לפני שמפענחים");
  assert.deepEqual(f("/q/red%20shoes"), ["q", "red shoes"]);
});
