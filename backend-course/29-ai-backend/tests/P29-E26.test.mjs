import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P29-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["chunk", "retrieve"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("chunk — פסקאות שלמות, ארוזות עד maxChars", async () => {
  const { chunk } = await get();
  const text = "aaaa\n\nbbbb\n\n\ncccc\n  \ndddd";
  assert.deepEqual(chunk(text, 10), ["aaaa\n\nbbbb", "cccc\n\ndddd"], "פסקאות מופרדות בשורה ריקה (גם עם רווחים); מחברים עם \\n\\n כל עוד האורך <= maxChars");
  assert.deepEqual(chunk(text, 9), ["aaaa", "bbbb", "cccc", "dddd"], "aaaa\\n\\nbbbb הוא 10 תווים — לא נכנס ב־9");
  assert.deepEqual(chunk(text), ["aaaa\n\nbbbb\n\ncccc\n\ndddd"], "ברירת מחדל 500");
  assert.deepEqual(chunk("  \n\n  "), []);
});
test("chunk — פסקה ארוכה מדי: לפי משפטים, ומשפט ארוך מדי — חיתוך", async () => {
  const { chunk } = await get();
  assert.deepEqual(chunk("One two. Three four! Five?", 12), ["One two.", "Three four!", "Five?"], "פסקה של 26 תווים ← משפטים (אחרי . ! ?). את המשפטים לא מחברים מחדש עם \\n\\n אם זה עובר את המגבלה");
  assert.deepEqual(chunk("abcdefghij", 4), ["abcd", "efgh", "ij"]);
  for (const c of chunk("x".repeat(1000) + "\n\nshort", 300)) assert.ok(c.length <= 300, `קטע של ${c.length} תווים`);
  assert.throws(() => chunk("x", 0), RangeError);
});
test("retrieve — ניקוד לפי מילים משותפות (3 אותיות ומעלה, בלי תלות באותיות גדולות)", async () => {
  const { retrieve } = await get();
  const chunks = ["Shipping takes 3-5 days", "Returns within 14 days. Opened beans cannot be returned", "Warranty: electric grinders two years"];
  assert.deepEqual(retrieve(chunks, "How many DAYS for shipping?").map((c) => [c.index, c.score]), [[0, 2], [1, 1]], "shipping + days ← 2; days ← 1; 'for' ו־'How' לא בטקסט");
  assert.deepEqual(retrieve(chunks, "grinders warranty", 1), [{ index: 2, score: 2, text: chunks[2] }], "k = 1");
  assert.deepEqual(retrieve(chunks, "xyz"), [], "בלי מילים משותפות — כלום");
  assert.deepEqual(retrieve(chunks, "days days days").map((c) => c.score), [1, 1], "מילה שחוזרת בשאלה נספרת פעם אחת; בתיקו — לפי index");
  assert.deepEqual(retrieve(["קפה אתיופי", "קפה קולומביאני", "מטחנה"], "איזה קפה אתיופי?").map((c) => c.index), [0, 1], "עברית");
});
