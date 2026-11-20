import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E99.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseEnv"]);

test("KEY=VALUE בסיסי", async () => {
  const { parseEnv } = await get();
  assert.deepEqual(parseEnv("PORT=3000\nDB_HOST=localhost"), { PORT: "3000", DB_HOST: "localhost" }, "הערכים נשארים מחרוזות");
  assert.deepEqual(parseEnv(""), {}, "קובץ ריק ← {}");
});
test("שורות ריקות והערות", async () => {
  const { parseEnv } = await get();
  const text = "# הגדרות\n\nPORT=3000\n   \n  # עוד הערה\nNODE_ENV=dev\n";
  assert.deepEqual(parseEnv(text), { PORT: "3000", NODE_ENV: "dev" });
});
test("רווחים, מירכאות ו־\\r\\n", async () => {
  const { parseEnv } = await get();
  assert.deepEqual(parseEnv("  PORT = 3000  \r\nAPP_NAME=\"My  App \"\r\nEMPTY=\r\nURL=postgres://u:p@h/db?x=1"), {
    PORT: "3000",
    APP_NAME: "My  App ",
    EMPTY: "",
    URL: "postgres://u:p@h/db?x=1",
  }, "רווחים סביב ה־= והערך יורדים, מירכאות כפולות יורדות והתוכן שלהן נשאר כמו שהוא, ו־= בתוך ערך נשאר");
});
test("מפתח שחוזר — האחרון קובע", async () => {
  const { parseEnv } = await get();
  assert.deepEqual(parseEnv("A=1\nB=2\nA=3"), { A: "3", B: "2" });
});
test("שורה לא תקינה ← Error עם מספר השורה", async () => {
  const { parseEnv } = await get();
  const bad = [
    ["PORT=3000\nport=4000", 2, "port=4000"],
    ["A=1\n\n# x\n1ABC=2", 4, "1ABC=2"],
    ["JUST_A_WORD", 1, "JUST_A_WORD"],
    ["A=1\r\nMY-KEY=2", 2, "MY-KEY=2"],
    ["=value", 1, "=value"],
  ];
  for (const [text, n, line] of bad) {
    const expected = `שורה ${n}: לא בפורמט KEY=VALUE: "${line}"`;
    assert.throws(() => parseEnv(text), (err) => err instanceof Error && err.message === expected, `צריך לזרוק Error עם ההודעה: ${expected}`);
  }
});
