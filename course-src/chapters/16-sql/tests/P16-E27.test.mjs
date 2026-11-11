import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P16-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["buildProductQuery"])).buildProductQuery;
const BASE = "SELECT id, name, price FROM products WHERE is_active";

test("עובר בדיקת טיפוסים, ו־ProductFilters מגביל את sort", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { buildProductQuery, type ProductFilters } from "FILE";
const f: ProductFilters = {};
const q: { text: string; values: unknown[] } = buildProductQuery({ category: "beans", minPrice: 0, maxPrice: 9, search: "x", inStock: false, sort: "-price", limit: 5 });
// @ts-expect-error — sort הוא רק "price" | "-price" | "name"
buildProductQuery({ sort: "date" });
// @ts-expect-error — minPrice הוא number
buildProductQuery({ minPrice: "10" });
`);
  assert.ok(p.ok, p.message);
});
test("בלי מסננים", async () => {
  const build = await get();
  assert.deepEqual(build({}), { text: `${BASE} ORDER BY id`, values: [] });
});
test("כל המסננים, לפי הסדר", async () => {
  const build = await get();
  assert.deepEqual(build({ category: "beans", maxPrice: 90, inStock: true, sort: "-price", limit: 2 }), {
    text: `${BASE} AND category = $1 AND price <= $2 AND stock > 0 ORDER BY price DESC, id LIMIT $3`,
    values: ["beans", 90, 2],
  });
  assert.deepEqual(build({ limit: 3, search: "grinder", minPrice: 0, inStock: false, sort: "price" }), {
    text: `${BASE} AND price >= $1 AND name ILIKE $2 AND stock = 0 ORDER BY price, id LIMIT $3`,
    values: [0, "%grinder%", 3],
  }, "minPrice: 0 ו־inStock: false הם מסננים אמיתיים (בדוק !== undefined, לא אמת/שקר)");
  assert.deepEqual(build({ sort: "name" }), { text: `${BASE} ORDER BY name`, values: [] });
});
test("מיון לא מוכר — שגיאה", async () => {
  const build = await get();
  assert.throws(() => build({ sort: "price; DROP TABLE products" }), { message: "מיון לא מוכר: price; DROP TABLE products" });
});
test("השאילתה רצה על נתוני החנות ומחזירה את המוצרים הנכונים", async (t) => {
  const build = await get();
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const names = async (filters) => {
    const { text, values } = build(filters);
    return (await db.query(text, values)).rows.map((r) => r.name);
  };
  assert.deepEqual(await names({ category: "beans", maxPrice: 90, inStock: true, sort: "-price", limit: 2 }), ["Ethiopia Beans 1kg", "Brazil Beans 250g"]);
  assert.deepEqual(await names({ search: "GRINDER", sort: "name" }), ["Electric Grinder Pro", "Grinder Cleaning Brush", "Hand Grinder"], "ILIKE — בלי תלות באותיות גדולות/קטנות");
  assert.deepEqual(await names({ inStock: false }), ["Colombia Beans 1kg", "V60 Ceramic"]);
  assert.deepEqual(await names({ minPrice: 100, maxPrice: 200, sort: "price" }), ["French Press 1L", "Moka Pot 6 Cups", "Hand Grinder"]);
});
test("SQL injection — הערך נשאר מחרוזת", async (t) => {
  const build = await get();
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const { text, values } = build({ search: "'; DROP TABLE products; --", category: "x' OR '1'='1" });
  assert.ok(!text.includes("DROP") && !text.includes("OR '1'"), "ערכים מהמשתמש לא נכנסים לטקסט של השאילתה — רק $1, $2...");
  assert.deepEqual((await db.query(text, values)).rows, []);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM products"))[0].n, 14, "טבלת products שרדה");
});
test("switch", () => {
  assert.match(code(import.meta.url, FILE), /\bswitch\s*\(/, "התרגיל מתרגל switch (פרק 4) לבחירת המיון");
});
