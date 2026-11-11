import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText, elementsOf } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E22.html"));
test("שלד", () => {
  const d = doc();
  assert.ok(d.doctype, "<!doctype html>");
  assert.equal(qs(d, "html")?.attrs.lang, "he");
  assert.equal(qs(d, "html")?.attrs.dir, "rtl");
  assert.ok(qs(d, "head meta[charset]"), "meta charset");
});
test("main", () => {
  const d = doc();
  const main = qs(d, "body main");
  assert.ok(main, "חסר main בתוך body");
  assert.equal(qsa(d, "h1").length, 1, "h1 אחד");
  assert.ok(qs(main, "h1"), "ה־h1 בתוך main");
  const img = qs(main, "img");
  assert.ok(img?.attrs.src, "img עם src");
  assert.ok((img?.attrs.alt ?? "").trim() !== "", "img עם alt שאינו ריק");
  const h2 = qsa(main, "h2").map(cleanText);
  assert.ok(h2.includes("מצרכים") && h2.includes("אופן ההכנה"), "שתי כותרות h2: מצרכים, אופן ההכנה");
  assert.ok(qsa(main, "ul > li").length >= 3, "ul עם 3 פריטים לפחות");
  assert.ok(qsa(main, "ol > li").length >= 3, "ol עם 3 שלבים לפחות");
  assert.ok(qs(main, "ol li strong"), "strong באחד השלבים");
  // הסדר: כל רשימה אחרי הכותרת שלה
  const kids = elementsOf(main).map((e) => (e.tag === "h2" ? cleanText(e) : e.tag));
  assert.ok(kids.indexOf("ul") > kids.indexOf("מצרכים") && kids.indexOf("ol") > kids.indexOf("אופן ההכנה"), "כל רשימה מופיעה אחרי ה־h2 שלה");
});
test("footer מחוץ ל־main", () => {
  const d = doc();
  assert.ok(qs(d, "body > footer"), "footer ישירות בתוך body (אח של main)");
  assert.ok(!qs(d, "main footer"), "footer לא בתוך main");
  assert.ok(qsa(d, "footer a").some((a) => (a.attrs.href ?? "").startsWith("https://")), "קישור https:// ב־footer");
});
