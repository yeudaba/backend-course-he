import { test } from "node:test";
import assert from "node:assert/strict";
import { shop } from "./_shop.mjs";
import { exportsOf, code } from "./_ts.mjs";

const FILE = "P19-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["getProductPage"])).getProductPage;

test("עמוד 1 ועמוד אחרון", async (t) => {
  const getProductPage = await get();
  const { prisma } = await shop(t, import.meta.url);
  const p1 = await getProductPage(prisma);
  assert.deepEqual(p1, {
    items: [
      { id: 1, name: "Ethiopia Beans 1kg", price: 89.9 },
      { id: 2, name: "Colombia Beans 1kg", price: 84.9 },
      { id: 3, name: "Brazil Beans 250g", price: 29.9 },
      { id: 4, name: "Hand Grinder", price: 189 },
      { id: 5, name: "Electric Grinder Pro", price: 649 },
    ],
    page: 1,
    total: 11,
    pages: 3,
  }, "ברירות מחדל: page 1, ‏pageSize 5. רק פעילים, לפי id, ומחיר כ־number");
  const p3 = await getProductPage(prisma, { page: 3 });
  assert.deepEqual(p3.items.map((p) => p.id), [12], "בעמוד 3: רק מוצר 12 (מוצר 11 לא פעיל)");
  assert.equal(p3.pages, 3);
  const p9 = await getProductPage(prisma, { page: 9 });
  assert.deepEqual(p9.items, [], "עמוד אחרי הסוף — רשימה ריקה, לא שגיאה");
  assert.equal(p9.total, 11);
});
test("סינון לפי קטגוריה ו־pageSize", async (t) => {
  const getProductPage = await get();
  const { prisma } = await shop(t, import.meta.url);
  const r = await getProductPage(prisma, { categoryId: 3, pageSize: 3, page: 2 });
  assert.deepEqual(r, { items: [{ id: 12, name: "Gooseneck Kettle", price: 229 }], page: 2, total: 4, pages: 2 }, "total סופר רק את הקטגוריה (אותו where לשתי השאילתות)");
  const none = await getProductPage(prisma, { categoryId: 5 });
  assert.deepEqual(none, { items: [], page: 1, total: 0, pages: 0 });
});
test("פרמטרים לא תקינים", async (t) => {
  const getProductPage = await get();
  const { prisma } = await shop(t, import.meta.url);
  for (const page of [0, -1, 1.5]) {
    await assert.rejects(getProductPage(prisma, { page }), (e) => e instanceof RangeError && e.message === "page חייב להיות מספר שלם חיובי", `page: ${page}`);
  }
  for (const pageSize of [0, 51, 2.5]) {
    await assert.rejects(getProductPage(prisma, { pageSize }), (e) => e instanceof RangeError && e.message === "pageSize חייב להיות 1–50", `pageSize: ${pageSize}`);
  }
});
test("שתי השאילתות במקביל", async (t) => {
  const getProductPage = await get();
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  await getProductPage(prisma, { page: 2 });
  assert.equal(queries.filter((q) => /SELECT/i.test(q)).length, 2, `נשלחו ${queries.length} שאילתות — צריך בדיוק findMany ו־count`);
  assert.match(code(import.meta.url, FILE), /Promise\.all\s*\(|\$transaction\s*\(\s*\[/, "התרגיל מתרגל Promise.all (פרק 10): הרשימה והספירה במקביל");
});
