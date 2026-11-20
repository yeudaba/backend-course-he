import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, assertNoPlaceholders, headings, section, links } from "./_docs.mjs";

const md = () => readDoc(import.meta.url, "P30-E121-cv.md");
const VERBS = new Set(["built", "designed", "implemented", "added", "cut", "reduced", "improved", "prevented", "migrated", "wrote", "tested", "deployed", "automated", "replaced", "fixed", "measured"]);

test("בלי placeholders, עם קישור GitHub", () => {
  const d = md();
  assertNoPlaceholders(d, "קורות החיים");
  assert.ok(links(d).some((l) => /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/.test(l)), "קישור ל־https://github.com/<user>");
});
test("בלי פרטים שלא שייכים", () => {
  const m = /date of birth|birth ?date|born\b|marital|married|single\b|ID number|ת״ז|תאריך לידה|מצב משפחתי/i.exec(md());
  assert.ok(!m, `"${m?.[0]}" — פרט שלא שייך לקורות חיים (P30-E55)`);
});
test("Projects: לפחות 3 נקודות, פועל ומספר בכל אחת", () => {
  const s = section(md(), "Projects");
  assert.ok(s, "חסר ## Projects");
  const bullets = s.split("\n").filter((l) => /^\s*[-*]\s+/.test(l)).map((l) => l.replace(/^\s*[-*]\s+/, "").trim());
  assert.ok(bullets.length >= 3, `יש ${bullets.length} נקודות — צריך לפחות 3`);
  for (const b of bullets) {
    assert.ok(!/^(responsible for|worked on|worked with|helped|participated in|assisted)\b/i.test(b), `"${b}" — מתחיל בתיאור תפקיד, לא בפעולה`);
    const first = (b.split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
    assert.ok(VERBS.has(first), `"${b}" — צריך להתחיל בפועל מהרשימה של P30-E53`);
    assert.match(b, /\d/, `"${b}" — אין מספר`);
  }
});
test("Projects לפני Education", () => {
  const h = headings(md()).map((x) => x.toLowerCase());
  assert.ok(h.includes("projects") && h.includes("education"), "## Projects ו־## Education");
  assert.ok(h.indexOf("projects") < h.indexOf("education"), "Projects צריך לבוא לפני Education");
});
