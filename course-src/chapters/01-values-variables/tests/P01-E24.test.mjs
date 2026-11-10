import { test } from "node:test";
import assert from "node:assert/strict";
import { run, printed, source, code } from "./_out.mjs";

const FILE = "P01-E24.js";
const ADDED = /^נוסף: (.+) \| פריטים: (\d+) \| סכום: (\d+(?:\.\d+)?)$/;

function check(r, fee) {
  printed(r);
  assert.equal(r.lines.length, 8, `הודפסו ${r.lines.length} שורות — ציפינו ל־8 (ארבע הוספות, ---, ושלוש שורות סיכום)`);
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const m = r.lines[i].match(ADDED);
    assert.ok(m, `שורה ${i + 1} ("${r.lines[i]}") לא בפורמט "נוסף: שם | פריטים: N | סכום: S"`);
    assert.equal(Number(m[2]), i + 1, `בשורה ${i + 1} מספר הפריטים צריך להיות ${i + 1}`);
    assert.ok(Number(m[3]) > sum, `בשורה ${i + 1} הסכום לא גדל — האם הוספת את מחיר המוצר?`);
    sum = Number(m[3]);
  }
  assert.equal(r.lines[4], "---");
  assert.equal(r.lines[5], `סכום העגלה: ${sum}`, "סכום העגלה צריך להיות הסכום אחרי ההוספה הרביעית (בלי משלוח)");
  assert.equal(r.lines[6], `דמי משלוח: ${fee}`);
  assert.equal(r.lines[7], `לתשלום: ${sum + fee}`, "לתשלום = סכום העגלה + דמי משלוח");
}

test("ארבע הוספות, ואז סיכום עם דמי משלוח 30", () => check(run(import.meta.url, FILE), 30));

test("דמי המשלוח שמורים במשתנה אחד (שינוי ל־45 משנה את הסכום לתשלום)", (t) => {
  const src = code(source(import.meta.url, FILE));
  const count = src.match(/=\s*30\s*;/g)?.length ?? 0;
  assert.ok(count > 0, "לא מצאנו בקוד '= 30;' — שמור את דמי המשלוח במשתנה, למשל const shippingFee = 30;");
  if (count > 1) {
    t.skip("יש בקוד כמה פעמים '= 30;' — לא נוכל לדעת מה מהם דמי המשלוח");
    return;
  }
  check(run(import.meta.url, FILE, { changes: [[/=\s*30\s*;/, "= 45;", "את דמי המשלוח (= 30)"]] }), 45);
});
