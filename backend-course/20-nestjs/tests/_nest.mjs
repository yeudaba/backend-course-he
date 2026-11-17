// עוזר לבדיקות של שאלות התרגול (E29 ואילך): מקמפל וטוען את הקובץ שלך, ובודק שייצאת את מה שהמשימה ביקשה.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import assert from "node:assert/strict";
import { loadNest } from "../../tools/nest.mjs";

export function exportsOf(testUrl, file, names) {
  const m = loadNest(testUrl, file);
  for (const name of names) {
    if (m[name] === undefined) assert.fail(`הקובץ ${file} לא מייצא את ${name}. כתוב export לפני ההגדרה (export class ${name} ... / export const ${name} = ...)`);
  }
  return m;
}
