import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { totalsByCategory, countByStatus, topCategory } = await load(import.meta.url, "P07-E13.js");

const sales = [{ category: "ספרים", amount: 80 }, { category: "מחשבים", amount: 1200 }, { category: "ספרים", amount: 45 }];
test("totalsByCategory", () => { assert.deepEqual(totalsByCategory(sales), { "ספרים": 125, "מחשבים": 1200 }); assert.deepEqual(totalsByCategory([]), {}); });
test("countByStatus", () => assert.deepEqual(countByStatus([{ status: "paid" }, { status: "pending" }, { status: "paid" }]), { paid: 2, pending: 1 }));
test("topCategory", () => { assert.equal(topCategory(sales), "מחשבים"); assert.equal(topCategory([]), null); });
test("topCategory לפי הסכום של הקטגוריה, לא לפי המכירה הגדולה ביותר", () => {
  const many = [{ category: "ספרים", amount: 300 }, { category: "משחקים", amount: 120 }, { category: "משחקים", amount: 110 }, { category: "משחקים", amount: 100 }];
  assert.equal(topCategory(many), "משחקים", "משחקים: 120+110+100 = 330 > ספרים: 300");
});
test("topCategory כשכל הסכומים שליליים (החזרים)", () => assert.equal(topCategory([{ category: "ספרים", amount: -40 }, { category: "משחקים", amount: -15 }]), "משחקים", "גם סכום שלילי הוא סכום — הגבוה ביותר הוא ‎-15"));
