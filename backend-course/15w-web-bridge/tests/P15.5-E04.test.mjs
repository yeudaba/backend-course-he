import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E04-profile.html"));

test("שלד תקין", () => {
  const d = doc();
  assert.ok(d.doctype, "חסר <!doctype html> בתחילת הקובץ");
  const html = qs(d, "html");
  assert.equal(html?.attrs.lang, "he", '<html lang="he" dir="rtl">');
  assert.equal(html.attrs.dir, "rtl", '<html lang="he" dir="rtl">');
  assert.ok(qs(d, "head meta[charset]"), '<meta charset="utf-8"> בתוך head');
  assert.match(qs(d, "head meta[name=viewport]")?.attrs.content ?? "", /width=device-width/, "meta viewport");
  assert.ok(cleanText(qs(d, "head title") ?? { children: [] }), "title לא ריק");
  const css = qsa(d, "head link").find((l) => l.attrs.rel === "stylesheet");
  assert.equal(css?.attrs.href, "P15.5-E05-profile.css", 'link rel="stylesheet" ל־P15.5-E05-profile.css');
});
test("התוכן בתוך main.card", () => {
  const d = doc();
  assert.ok(qs(d, "main.card"), '<main class="card">');
  assert.ok(cleanText(qs(d, "main.card h1") ?? { children: [] }), "כותרת h1 עם השם שלך");
  assert.ok(qs(d, "main.card p"), "פסקה");
  assert.ok(qsa(d, "main.card ul.tags li").length >= 3, '<ul class="tags"> עם 3 טכנולוגיות לפחות');
  assert.ok(qsa(d, "main.card a").some((a) => /^https:\/\/github\.com\/\S+/.test(a.attrs.href ?? "")), "קישור ל־https://github.com/…");
});
test("טופס צור קשר", () => {
  const d = doc();
  const f = (name) => qs(d, `main.card form [name=${name}]`);
  assert.equal(f("name")?.tag, "input", 'input בשם name');
  assert.ok("required" in f("name").attrs, "שם: required");
  assert.equal(f("email")?.attrs.type, "email", 'input בשם email עם type="email"');
  assert.ok("required" in f("email").attrs, "אימייל: required");
  assert.equal(f("message")?.tag, "textarea", "textarea בשם message");
  const fors = new Set(qsa(d, "label[for]").map((l) => l.attrs.for));
  for (const n of ["name", "email", "message"]) assert.ok(f(n).attrs.id && fors.has(f(n).attrs.id), `לשדה ${n} אין label עם for שמתאים ל־id שלו`);
  const btn = qsa(d, "main.card form .actions button").find((b) => (b.attrs.type ?? "submit") === "submit");
  assert.ok(btn, 'כפתור שליחה בתוך <div class="actions">');
});
