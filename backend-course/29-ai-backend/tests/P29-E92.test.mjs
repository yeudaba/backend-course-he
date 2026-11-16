import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { includesAll, excludesAll, maxWords, all } = await load(import.meta.url, "P29-E92.ts");

test("includesAll / excludesAll — בלי הבדל רישיות, בסדר של המילים", () => {
  const inc = includesAll(["30 יום", "קבלה", "Refund"]);
  assert.equal(inc("אפשר להחזיר תוך 30 יום עם קבלה. REFUND policy"), true);
  assert.equal(inc("אפשר להחזיר עם קבלה"), "חסר: 30 יום, Refund");
  assert.equal(includesAll([])("x"), true);
  const exc = excludesAll(["internal", "מחיר ספק"]);
  assert.equal(exc("תשובה רגילה"), true);
  assert.equal(exc("לפי מחיר ספק ב־INTERNAL doc"), "אסור: internal, מחיר ספק");
});
test("maxWords", () => {
  assert.equal(maxWords(3)("  אחת   שתיים\nשלוש "), true);
  assert.equal(maxWords(3)("אחת שתיים שלוש ארבע"), "ארוך מדי: 4 מילים (עד 3)");
  assert.equal(maxWords(0)(""), true);
  assert.equal(maxWords(0)("   "), true);
});
test("all — כל הסיבות, בסדר", () => {
  const c = all(includesAll(["30 יום"]), excludesAll(["internal"]), maxWords(5));
  assert.equal(c("החזרה תוך 30 יום"), true);
  assert.equal(c("לפי internal doc אפשר בלי הגבלה בכלל באמת"), "חסר: 30 יום; אסור: internal; ארוך מדי: 8 מילים (עד 5)");
  assert.equal(all()("x"), true);
  assert.equal(all(maxWords(1), includesAll(["z"]))("a b"), "ארוך מדי: 2 מילים (עד 1); חסר: z");
});
