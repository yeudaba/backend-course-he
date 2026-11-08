import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, words, assertNoPlaceholders, section, links } from "./_docs.mjs";

const md = readDoc(import.meta.url, "P30-E11.md");

test("בלי placeholders", () => assertNoPlaceholders(md, "פרופיל LinkedIn"));
test("Headline: עד 220 תווים, עם Backend ולא רק 'מחפש עבודה'", () => {
  const h = section(md, "Headline")?.trim();
  assert.ok(h, "## Headline");
  assert.ok(h.length <= 220, `${h.length} תווים`);
  assert.match(h, /backend/i);
  assert.ok(!/^(looking for|seeking|open to)/i.test(h), "הכותרת אומרת מה אתה — לא מה אתה מחפש (לזה יש Open to work)");
});
test("About: 80–300 מילים, עם פרויקט ועם הזמנה ליצור קשר", () => {
  const a = section(md, "About");
  assert.ok(a, "## About");
  const n = words(a).length;
  assert.ok(n >= 80 && n <= 300, `${n} מילים`);
  assert.match(a, /\d/, "לפחות מספר אחד (משהו שמדדת או בנית)");
});
test("Featured: לפחות 2 קישורים", () => {
  const f = section(md, "Featured");
  assert.ok(f && links(f).length >= 2, "## Featured עם קישור לפרויקט חי ול־GitHub");
});
