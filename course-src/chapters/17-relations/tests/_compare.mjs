// עוזר לבדיקות של שאלות התרגול (E29 ואילך): מריץ את הקובץ שלך ואת הפתרון על אותם נתונים —
// על store.sql כמו שהוא, וגם אחרי שינויים קטנים בנתונים. כך שאילתה שמחזירה תוצאה "מועתקת" (ערכים קבועים) לא עוברת.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { sandbox } from "../../tools/sql.mjs";

// changes: [["תיאור השינוי", "SQL שמשנה את הנתונים"], ...]
export async function sameAsSolution(t, testUrl, file, changes = [], seed = "store.sql") {
  const solution = path.join(path.dirname(fileURLToPath(testUrl)), "..", "solutions", file);
  for (const [label, extra] of [["הנתונים של store.sql", ""], ...changes]) {
    const mine = await sandbox(t, testUrl, seed);
    if (extra) await mine.query(extra);
    const got = await mine.fileRows(file);
    const ref = await sandbox(t, testUrl, seed);
    if (extra) await ref.query(extra);
    const res = await ref.query(fs.readFileSync(solution, "utf8"));
    const expected = (Array.isArray(res) ? res.at(-1) : res).rows;
    assert.deepEqual(Object.keys(got?.[0] ?? expected[0] ?? {}), Object.keys(expected[0] ?? {}), `שמות העמודות והסדר שלהן (${label})`);
    assert.deepEqual(got, expected, `התוצאה לא נכונה — ${label}`);
  }
}
