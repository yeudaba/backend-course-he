import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P01-E49.js";
const bare = (src) => code(src).replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g, '""');

test("הפלט נשאר זהה", () => {
  sameOutput(run(import.meta.url, FILE), ["הזמנה מספר: 1042", "סוג מספר ההזמנה: number", "פריט ראשון: 35", "פריט שני: 12.5", "סה״כ: 47.5", "נשלחה: false"]);
});

test("כל ערך כתוב בקוד פעם אחת בלבד, והסה״כ לא כתוב בכלל", () => {
  const src = bare(source(import.meta.url, FILE));
  for (const n of ["1042", "35", "12.5"]) {
    const count = src.match(new RegExp(`(?<![\\d.])${n.replace(".", "\\.")}(?![\\d.])`, "g"))?.length ?? 0;
    assert.equal(count, 1, `${n} כתוב בקוד ${count} פעמים — שמור אותו במשתנה, וכתוב אותו פעם אחת`);
  }
  assert.ok(!/47\.5/.test(src), "47.5 כתוב בקוד — הסה״כ צריך להיות מחושב");
});

test("משנים את מחיר הפריט השני ל־20 במקום אחד — והסה״כ מתעדכן", () => {
  const r = run(import.meta.url, FILE, { changes: [[/=\s*12\.5\b/, "= 20", "את השורה שבה 12.5 נשמר במשתנה (= 12.5)"]] });
  sameOutput(r, ["הזמנה מספר: 1042", "סוג מספר ההזמנה: number", "פריט ראשון: 35", "פריט שני: 20", "סה״כ: 55", "נשלחה: false"]);
});
