import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E21.html"));
test("שלד", () => {
  const d = doc();
  assert.ok(d.doctype, "הדף מתחיל ב־<!doctype html>");
  const html = qs(d, "html");
  assert.ok(html, "חסרה תגית html");
  assert.equal(html.attrs.lang, "he", 'lang="he"');
  assert.equal(html.attrs.dir, "rtl", 'dir="rtl"');
});
test("head", () => {
  const d = doc();
  assert.equal(qs(d, "head meta[charset]")?.attrs.charset?.toLowerCase(), "utf-8", '<meta charset="utf-8"> בתוך head');
  assert.match(qs(d, "head meta[name=viewport]")?.attrs.content ?? "", /width=device-width/, "meta viewport עם width=device-width");
  assert.equal(cleanText(qs(d, "head title") ?? { children: [] }), "כרטיס ביקור", "title בדיוק 'כרטיס ביקור'");
});
test("body", () => {
  const d = doc();
  assert.equal(qsa(d, "h1").length, 1, "h1 אחד בדיוק");
  assert.ok(qs(d, "body h1") && cleanText(qs(d, "body h1")) !== "", "h1 בתוך body, עם טקסט");
  assert.ok(qsa(d, "body p").length >= 1, "פסקה אחת לפחות");
  assert.ok(qsa(d, "body a").some((a) => (a.attrs.href ?? "").startsWith("mailto:")), "קישור עם href שמתחיל ב־mailto:");
});
