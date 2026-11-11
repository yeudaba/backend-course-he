import { test } from "node:test";
import assert from "node:assert/strict";
import { run, printed, source, code } from "./_out.mjs";

const FILE = "P01-E16.js";
const FIELDS = [
  ["name", "string"],
  ["age", "number"],
  ["city", "string"],
  ["isSubscribed", "boolean"],
  ["ordersCount", "number"],
];

test("חמש שורות בפורמט  שדה: ערך | סוג", () => {
  const r = run(import.meta.url, FILE);
  printed(r);
  assert.equal(r.lines.length, 5, `הודפסו ${r.lines.length} שורות — צריך חמש, אחת לכל שדה`);
  FIELDS.forEach(([field, type], i) => {
    const m = r.lines[i].match(/^(\w+): (.+) \| (\w+)$/);
    assert.ok(m, `שורה ${i + 1} ("${r.lines[i]}") לא בפורמט "${field}: ערך | ${type}"`);
    assert.equal(m[1], field, `בשורה ${i + 1} ציפינו לשדה ${field}`);
    assert.equal(m[3], type, `הסוג של ${field} צריך להיות ${type}`);
  });
});

test("הערכים מתאימים לסוגים (גיל ומספר הזמנות הם מספרים, מנוי הוא true/false)", () => {
  const r = run(import.meta.url, FILE);
  printed(r);
  const value = (i) => r.lines[i]?.match(/^\w+: (.+) \| \w+$/)?.[1];
  assert.match(value(1) ?? "", /^-?\d+(\.\d+)?$/, "age צריך להיות מספר");
  assert.match(value(4) ?? "", /^-?\d+$/, "ordersCount צריך להיות מספר שלם");
  assert.match(value(3) ?? "", /^(true|false)$/, "isSubscribed צריך להיות true או false");
});

test("הסוג מחושב עם typeof (לא כתוב ביד)", () => {
  const n = code(source(import.meta.url, FILE)).match(/typeof/g)?.length ?? 0;
  assert.ok(n >= 5, `מצאנו typeof ${n} פעמים — צריך אחד לכל שדה`);
});
