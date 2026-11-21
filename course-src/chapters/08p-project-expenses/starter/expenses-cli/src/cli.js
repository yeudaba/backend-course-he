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
//
// מה מודפס (log) בדיוק — הבודק משווה מילה במילה:
//   add (הצליח)          → "נוספה הוצאה #3"                        (המזהה של ההוצאה החדשה)  ← 0
//   list                  → formatExpenses(...)                      ← 0
//   delete 3 (הצליח)     → "הוצאה #3 נמחקה"                        ← 0
//   summary 2026-10       → formatSummary(...)                       ← 0
//   help, או בלי פקודה   → HELP                                      ← 0
//   פקודה לא מוכרת oops  → "פקודה לא מוכרת: oops", שורה ריקה, ו־HELP  ← 1
//   כל שגיאה (throw)      → "שגיאה: " + err.message                  ← 1
//     add בלי סכום       → "חסרים פרטים. דוגמה: add 2026-10-01 food 54.5 lunch"
//     delete בלי מזהה    → "חסר מזהה. דוגמה: delete 3"
//     summary בלי חודש   → "חסר חודש. דוגמה: summary 2026-10"
//     list עם דגל לא מוכר → "אפשרות לא מוכרת: --color"  ·  דגל בלי ערך → "חסר ערך אחרי --month"
export function run(argv, { filePath, log = console.log }) {
  // כתוב כאן
}

// מריצים רק כשהקובץ הופעל ישירות (node src/cli.js), לא כשמייבאים אותו בבדיקות
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "expenses.json");
  process.exitCode = run(process.argv.slice(2), { filePath });
}
