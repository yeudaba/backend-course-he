import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E17.js";
const withPassword = (p) => run(import.meta.url, FILE, { changes: [[/(const\s+password\s*=\s*)(["'`]).*?\2/, `$1"${p}"`, "את השורה const password = ...;"]] });

for (const [p, msg] of [
  ["", "חובה להזין סיסמה"],
  ["abc", "לפחות 8 תווים"],
  ["Dana1234", "הסיסמה לא יכולה להיות שם המשתמש"],
  ["password", "סיסמה נפוצה מדי"],
  ["12345678", "סיסמה נפוצה מדי"],
  ["longpassword1", "חייב תו מיוחד: ! @ #"],
  ["long!password1", "סיסמה תקינה"],
  ["at@sign12", "סיסמה תקינה"],
]) {
  test(`"${p}" ← ${msg}`, () => sameOutput(withPassword(p), [msg]));
}
