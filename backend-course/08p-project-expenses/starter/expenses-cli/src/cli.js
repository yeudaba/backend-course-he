// נקודת הכניסה: מפרשת את הפקודה מה־Terminal ומחברת בין הלוגיקה לאחסון.
import path from "node:path";
import { fileURLToPath } from "node:url";
// ייבא כאן את מה שצריך מ־./expenses.js ומ־./storage.js

const HELP = `שימוש:
  add <YYYY-MM-DD> <קטגוריה> <סכום> [הערה...]   הוספת הוצאה
  list [--category X] [--month YYYY-MM]          רשימת הוצאות
  delete <id>                                     מחיקת הוצאה
  summary <YYYY-MM>                               סיכום חודשי
  help                                            העזרה הזו`;

// argv: המילים שאחרי "node src/cli.js", למשל ["add", "2026-10-01", "food", "54.5"]
// filePath: איפה קובץ הנתונים. log: פונקציית הדפסה (בבדיקות מחליפים אותה)
// מחזירה 0 בהצלחה ו־1 בשגיאה. שגיאות מודפסות כ־"שגיאה: ..." — התוכנית לא קורסת.
export function run(argv, { filePath, log = console.log }) {
  // כתוב כאן
}

// מריצים רק כשהקובץ הופעל ישירות (node src/cli.js), לא כשמייבאים אותו בבדיקות
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "expenses.json");
  process.exitCode = run(process.argv.slice(2), { filePath });
}
