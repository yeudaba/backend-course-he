import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseClassification: f } = await load(import.meta.url, "P29-E101.ts");
const fence = "```";

test("JSON לבד, בגדר, ועם טקסט מסביב", () => {
  const ok = { ok: true, value: { category: "billing", confidence: 0.9 } };
  assert.deepEqual(f('{"category":"billing","confidence":0.9}'), ok);
  assert.deepEqual(f(`${fence}json\n{"category": "billing", "confidence": 0.9}\n${fence}`), ok, "JSON בתוך גדר");
  assert.deepEqual(f('Here is the result:\n{\n  "category": "billing",\n  "confidence": 0.9\n}\nLet me know!'), ok);
});
test("רק השדות המותרים", () => {
  const r = f('{"category":"shipping","confidence":1,"note":"customer email: a@b.c"}');
  assert.deepEqual(r, { ok: true, value: { category: "shipping", confidence: 1 } }, "שדות שהמודל הוסיף לא עוברים הלאה");
});
test("ערכים לא תקינים ← ok: false, בלי לזרוק", () => {
  for (const text of [
    '{"category":"refund","confidence":0.8}',
    '{"category":"billing","confidence":"0.9"}',
    '{"category":"billing","confidence":1.5}',
    '{"category":"billing"}',
    "Sorry, I can't classify this.",
    `${fence}json\n{"category": "billing",\n${fence}`,
    "",
  ]) {
    let r;
    assert.doesNotThrow(() => (r = f(text)), `זרק על: ${text}`);
    assert.equal(r.ok, false, `צריך ok: false על: ${text}`);
    assert.equal(typeof r.error, "string");
  }
});
