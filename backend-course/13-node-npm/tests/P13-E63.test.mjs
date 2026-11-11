import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E63.mjs", ["lintEnv"])).lintEnv;

test("הדוגמה מהמשימה", async () => {
  const lintEnv = await get();
  assert.deepEqual(lintEnv('PORT=8080\nport=9\nAPP_NAME=Dana Shop\nPORT=1\nTITLE="Hi\n'), [
    "שורה 2: שם לא תקין: port",
    "שורה 3: ערך עם רווחים בלי מירכאות",
    "שורה 4: PORT מוגדר שוב (קודם בשורה 1)",
    "שורה 5: מירכאות לא סגורות",
  ]);
});
test("קובץ תקין — אין אזהרות", async () => {
  const lintEnv = await get();
  assert.deepEqual(lintEnv('# הערה\n\n  # עוד\nPORT=8080\nAPP_NAME="Dana Shop"\nGREETING=\'שלום עולם\'\nEMPTY=\nURL=postgres://u:p@h/db?a=b\nX1_Y=  spaced-edges  \n'), []);
});
test("עוד מקרים", async () => {
  const lintEnv = await get();
  assert.deepEqual(lintEnv("BROKEN\n=5\n1ABC=2\nMY-KEY=3\nA='x\"\nB=\"\nC=ok\nC=again\nC=third"), [
    "שורה 1: חסר =",
    "שורה 2: שם לא תקין: ",
    "שורה 3: שם לא תקין: 1ABC",
    "שורה 4: שם לא תקין: MY-KEY",
    "שורה 5: מירכאות לא סגורות",
    "שורה 6: מירכאות לא סגורות",
    "שורה 8: C מוגדר שוב (קודם בשורה 7)",
    "שורה 9: C מוגדר שוב (קודם בשורה 7)",
  ]);
  assert.deepEqual(lintEnv(""), []);
});
