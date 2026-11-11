// עוזר לבדיקות של תרגולי הכתיבה (E26–E28): טוען את הקובץ שלך, ובודק שייצאת את מה שהמשימה ביקשה
// ושהשתמשת בתחביר שהתרגיל מתרגל. לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import assert from "node:assert/strict";
import { load, target } from "../../tools/load.mjs";

// מחרוזות (קבוצה 1) או הערות (// ו־/* */)
const TOKENS = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

// הקוד שלך בלי הערות — כדי שמילה שכתבת בהערה לא תיחשב
export function code(testUrl, file) {
  const p = target(testUrl, file);
  if (!fs.existsSync(p)) throw new Error(`לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?`);
  return fs.readFileSync(p, "utf8").replace(TOKENS, (all, str) => str ?? "");
}

// טוען את הקובץ ומוודא שכל השמות יוצאו (module.exports או export)
export async function exportsOf(testUrl, file, names, how = "export") {
  const mod = await load(testUrl, file);
  for (const name of names) {
    if (mod[name] === undefined) {
      assert.fail(`הקובץ ${file} לא מייצא את ${name}. ${how === "module.exports" ? `בסוף הקובץ: module.exports = { ${names.join(", ")} };` : `כתוב export לפני ההגדרה: ${/^[A-Z]/.test(name) ? `export class ${name}` : `export function ${name}(...)`}`}`);
    }
  }
  return mod;
}
