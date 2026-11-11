import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P23-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseEnv"])).parseEnv;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שורות רגילות, הערות, export ו־= בתוך הערך", async () => {
  const parseEnv = await get();
  const env = parseEnv("# comment\n\n  export NODE_ENV=production\nDATABASE_URL=postgres://u:p@db/app?sslmode=disable\n   # indented comment\nPORT = 3000\n");
  assert.deepEqual(env, { NODE_ENV: "production", DATABASE_URL: "postgres://u:p@db/app?sslmode=disable", PORT: "3000" });
});
test("מירכאות כפולות, בודדות, והערה בסוף השורה", async () => {
  const parseEnv = await get();
  assert.deepEqual(parseEnv('A="x\\ny"'), { A: "x\ny" }, "במירכאות כפולות \\n הופך לשורה חדשה");
  assert.deepEqual(parseEnv("A='x\\ny # z'"), { A: "x\\ny # z" }, "במירכאות בודדות שום דבר לא משתנה");
  assert.deepEqual(parseEnv("A=abc # הערה"), { A: "abc" }, "' #' מחוץ למירכאות מתחיל הערה");
  assert.deepEqual(parseEnv("A=a#b"), { A: "a#b" }, "# בלי רווח לפניו הוא חלק מהערך (סיסמה)");
  assert.deepEqual(parseEnv('A="a # b"'), { A: "a # b" }, "בתוך מירכאות # הוא לא הערה");
  assert.deepEqual(parseEnv("EMPTY=\nQ=\""), { EMPTY: "", Q: '"' }, "ערך ריק, ומירכה בודדת שאינה סגורה");
});
test("שם שחוזר — האחרון קובע", async () => {
  const parseEnv = await get();
  assert.deepEqual(parseEnv("A=1\nB=2\nA=3"), { A: "3", B: "2" });
});
test("שורה שבורה ← SyntaxError עם מספר השורה", async () => {
  const parseEnv = await get();
  assert.throws(() => parseEnv("A=1\n2B=x"), (e) => e instanceof SyntaxError && e.message.startsWith("שורה 2:"), "שם שמתחיל בספרה, בשורה 2");
  assert.throws(() => parseEnv("# x\n\nJUSTTEXT"), (e) => e instanceof SyntaxError && e.message.startsWith("שורה 3:"), "שורה בלי =, שורה 3 (הערות ושורות ריקות נספרות)");
  assert.throws(() => parseEnv("MY-VAR=1"), SyntaxError, "מקף לא מותר בשם");
  assert.throws(() => parseEnv("=1"), SyntaxError, "שם ריק");
});
