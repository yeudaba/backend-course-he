import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText, elementsOf } from "./_html.mjs";

const table = () => qs(parseHtml(readStarter(import.meta.url, "P15.5-E26.html")), "table");
test("caption ו־thead", () => {
  const t = table();
  assert.ok(t, "חסר table");
  assert.equal(elementsOf(t)[0]?.tag, "caption", "caption הוא הילד הראשון של table");
  assert.equal(cleanText(qs(t, "caption")), "ההזמנות שלי");
  assert.deepEqual(qsa(t, "thead tr th").map(cleanText), ["מספר", "תאריך", "סכום"]);
});
test("tbody", () => {
  const rows = qsa(table(), "tbody tr");
  assert.ok(rows.length >= 3, "3 שורות לפחות ב־tbody");
  for (const r of rows) {
    const cells = qsa(r, "td");
    assert.equal(cells.length, 3, "3 td בכל שורה");
    assert.equal(cells[2].attrs.class, "num", 'תא הסכום עם class="num"');
  }
});
test("tfoot", () => {
  const t = table();
  const row = qs(t, "tfoot tr");
  assert.ok(row, "שורה ב־tfoot");
  assert.equal(cleanText(qs(row, "th") ?? { children: [] }), "סה״כ", 'th "סה״כ"');
  const td = qs(row, "td");
  assert.equal(td?.attrs.colspan, "2", 'td עם colspan="2"');
  assert.equal(td.attrs.class, "num");
  assert.ok(cleanText(td) !== "", "הסכום לא ריק");
});
