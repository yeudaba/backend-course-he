import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const FILE = "P25.7-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["buildProductFilter", "searchProducts"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("buildProductFilter — הפילטר עצמו", async () => {
  const { buildProductFilter } = await get();
  assert.deepEqual(buildProductFilter({}), {});
  assert.deepEqual(buildProductFilter({ sort: "x", $where: "1", page: "2" }), {}, "מפתחות לא מוכרים — מתעלמים");
  assert.deepEqual(buildProductFilter({ q: " v60 (ceramic) " }), { name: { $regex: "v60 \\(ceramic\\)", $options: "i" } }, "trim, ותווים מיוחדים של regex עם \\ לפניהם");
  assert.deepEqual(buildProductFilter({ minPrice: "50" }), { price: { $gte: 50 } }, "מחיר כמספר, לא כמחרוזת");
  assert.deepEqual(buildProductFilter({ minPrice: "0", maxPrice: "55.5" }), { price: { $gte: 0, $lte: 55.5 } });
  assert.deepEqual(buildProductFilter({ tags: " pour-over, ,kettle," }), { tags: { $all: ["pour-over", "kettle"] } });
  assert.deepEqual(buildProductFilter({ tags: " , " }), {}, "בלי תגיות אמיתיות — בלי תנאי");
  assert.deepEqual(buildProductFilter({ inStock: "true" }), { stock: { $gt: 0 } });
  assert.deepEqual(buildProductFilter({ inStock: "false" }), { stock: 0 });
  assert.deepEqual(buildProductFilter({ q: "", category: "" }), {}, "ערך ריק — בלי תנאי");
});
test("ערכים לא תקינים ← RangeError", async () => {
  const { buildProductFilter } = await get();
  for (const bad of [{ minPrice: "abc" }, { maxPrice: "" }, { minPrice: "-1" }, { maxPrice: "Infinity" }, { inStock: "yes" }, { minPrice: "100", maxPrice: "50" }]) {
    assert.throws(() => buildProductFilter(bad), RangeError, JSON.stringify(bad));
  }
});
test("searchProducts מול MongoDB אמיתי", async (t) => {
  const { searchProducts } = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await searchProducts(db, { q: "V60" }), ["V60 Dripper"]);
  assert.deepEqual(await searchProducts(db, { q: "." }), [], "נקודה היא תו רגיל — בלי escape היא מתאימה לכל מוצר");
  assert.deepEqual(await searchProducts(db, { q: "(" }), [], "( בלי escape — שגיאה של Mongo");
  assert.deepEqual(await searchProducts(db, { category: "beans", inStock: "true" }), ["Decaf Brazil", "Ethiopia Yirgacheffe", "House Espresso Blend"]);
  assert.deepEqual(await searchProducts(db, { minPrice: "50", maxPrice: "89" }), ["Colombia Huila", "Decaf Brazil", "Ethiopia Yirgacheffe", "V60 Dripper"], "גבולות כוללים: 50 ו־89");
  assert.deepEqual(await searchProducts(db, { tags: "pour-over,kettle" }), ["Gooseneck Kettle"], "$all — כל התגיות");
  assert.deepEqual(await searchProducts(db, { inStock: "false" }), ["Colombia Huila", "Gooseneck Kettle"]);
  assert.deepEqual(await searchProducts(db, { category: '{"$ne":null}' }), [], "מחרוזת נשארת מחרוזת");
});
