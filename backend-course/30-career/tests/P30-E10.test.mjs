import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, words, assertNoPlaceholders, headings, section, links } from "./_docs.mjs";

const md = readDoc(import.meta.url, "P30-E10.md");
const WEAK = /^(responsible for|worked on|helped|was part of|participated|assisted|various|did)\b/i;

test("באנגלית, בלי placeholders", () => {
  assertNoPlaceholders(md, "קורות החיים");
  assert.ok(!/[֐-׿]/.test(md), "קורות חיים לחברות הייטק — באנגלית בלבד");
});
test("עמוד אחד: 250–650 מילים", () => {
  const n = words(md).length;
  assert.ok(n >= 250 && n <= 650, `${n} מילים`);
});
test("פרטי קשר בראש: אימייל, GitHub, LinkedIn", () => {
  const top = md.split("\n").slice(0, 8).join("\n");
  assert.match(top, /[\w.+-]+@[\w-]+\.[\w.]+/, "אימייל");
  assert.match(top, /github\.com\/[\w.-]+/, "GitHub");
  assert.match(top, /linkedin\.com\/in\/[\w.-]+/, "LinkedIn");
});
test("בלי פרטים אישיים מיותרים", () => {
  assert.ok(!/\b(date of birth|born|age:|marital|married|single|id number|passport|religion)\b/i.test(md), "גיל, מצב משפחתי, ת״ז — לא בקורות חיים");
});
test("הסעיפים", () => {
  const h = headings(md).map((x) => x.toLowerCase());
  for (const s of ["summary", "skills", "projects", "education", "languages"]) assert.ok(h.some((x) => x.startsWith(s)), `חסר סעיף ## ${s}`);
});
test("פרויקטים: לפחות 2, עם קישור ו־2+ נקודות שמתחילות בפועל, וחצי מהן עם מספר", () => {
  const p = section(md, "Projects");
  assert.ok(p, "## Projects");
  const blocks = p.split(/^###\s+/m).slice(1);
  assert.ok(blocks.length >= 2, `${blocks.length} פרויקטים (### לכל אחד)`);
  let withNumber = 0;
  let total = 0;
  for (const b of blocks) {
    const title = b.split("\n")[0];
    assert.ok(links(b).some((l) => /github\.com/.test(l)), `${title}: קישור ל־GitHub`);
    const bullets = [...b.matchAll(/^[-*]\s+(.+)$/gm)].map((m) => m[1].trim());
    assert.ok(bullets.length >= 2, `${title}: לפחות 2 נקודות`);
    for (const bl of bullets) {
      total++;
      assert.ok(!WEAK.test(bl), `"${bl.slice(0, 40)}…" — פתח בפועל חזק (Built, Designed, Reduced…)`);
      assert.match(bl, /^[A-Z]/, `"${bl.slice(0, 30)}…" — מתחיל באות גדולה`);
      assert.ok(words(bl).length <= 32, `"${bl.slice(0, 40)}…" — ארוך מדי (עד שורה וחצי)`);
      if (/\d/.test(bl)) withNumber++;
    }
  }
  assert.ok(withNumber * 2 >= total, `${withNumber}/${total} נקודות עם מספר — מספרים מוכיחים`);
});
