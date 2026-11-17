import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, elementsOf } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E24.html"));
test("שלד ומבנה", () => {
  const d = doc();
  assert.ok(d.doctype && qs(d, "html")?.attrs.lang === "he" && qs(d, "html")?.attrs.dir === "rtl", "שלד מלא עם lang ו־dir");
  const body = qs(d, "body");
  assert.ok(body, "חסר body");
  assert.deepEqual(elementsOf(body).map((e) => e.tag).filter((t) => ["header", "main", "footer"].includes(t)), ["header", "main", "footer"], "בתוך body: header, main, footer — בסדר הזה");
  assert.equal(qsa(d, "h1").length, 1, "h1 אחד בכל הדף");
  assert.ok(qs(d, "header h1"), "ה־h1 בתוך header");
  assert.equal(qsa(d, "div").length, 0, "בלי div");
});
test("nav", () => {
  const d = doc();
  const links = qsa(d, "header nav ul li a");
  assert.equal(links.length, 3, "nav > ul עם 3 קישורים (כל אחד בתוך li)");
  assert.ok(links.every((a) => (a.attrs.href ?? "").startsWith("/")), "כל href מתחיל ב־/");
});
test("main ו־footer", () => {
  const d = doc();
  const sections = qsa(d, "main > section");
  assert.equal(sections.length, 2, "2 section בתוך main");
  assert.ok(sections.every((s) => s.attrs.id && qs(s, "h2")), "לכל section יש id ו־h2");
  assert.notEqual(sections[0].attrs.id, sections[1].attrs.id, "ids שונים");
  assert.ok(qs(d, "footer p"), "p בתוך footer");
});
