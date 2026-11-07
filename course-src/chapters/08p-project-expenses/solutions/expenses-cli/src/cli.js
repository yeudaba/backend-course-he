// נקודת הכניסה: מפרשת את הפקודה מה־Terminal ומחברת בין הלוגיקה לאחסון.
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addExpense,
  removeExpense,
  filterExpenses,
  monthlySummary,
  formatExpenses,
  formatSummary,
} from "./expenses.js";
import { loadExpenses, saveExpenses } from "./storage.js";

const HELP = `שימוש:
  add <YYYY-MM-DD> <קטגוריה> <סכום> [הערה...]   הוספת הוצאה
  list [--category X] [--month YYYY-MM]          רשימת הוצאות
  delete <id>                                     מחיקת הוצאה
  summary <YYYY-MM>                               סיכום חודשי
  help                                            העזרה הזו`;

function readOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    if (flag !== "--category" && flag !== "--month") {
      throw new Error(`אפשרות לא מוכרת: ${flag}`);
    }
    if (value === undefined) {
      throw new Error(`חסר ערך אחרי ${flag}`);
    }
    options[flag.slice(2)] = value;
  }
  return options;
}

export function run(argv, { filePath, log = console.log }) {
  const [command, ...args] = argv;
  try {
    switch (command) {
      case "add": {
        const [date, category, amount, ...noteWords] = args;
        if (amount === undefined) {
          throw new Error("חסרים פרטים. דוגמה: add 2026-10-01 food 54.5 lunch");
        }
        const updated = addExpense(loadExpenses(filePath), { date, category, amount, note: noteWords.join(" ") });
        saveExpenses(filePath, updated);
        log(`נוספה הוצאה #${updated[updated.length - 1].id}`);
        return 0;
      }
      case "list": {
        const expenses = filterExpenses(loadExpenses(filePath), readOptions(args));
        log(formatExpenses(expenses));
        return 0;
      }
      case "delete": {
        if (args[0] === undefined) {
          throw new Error("חסר מזהה. דוגמה: delete 3");
        }
        saveExpenses(filePath, removeExpense(loadExpenses(filePath), args[0]));
        log(`הוצאה #${args[0]} נמחקה`);
        return 0;
      }
      case "summary": {
        if (args[0] === undefined) {
          throw new Error("חסר חודש. דוגמה: summary 2026-10");
        }
        log(formatSummary(monthlySummary(loadExpenses(filePath), args[0])));
        return 0;
      }
      case "help":
      case undefined:
        log(HELP);
        return 0;
      default:
        log(`פקודה לא מוכרת: ${command}\n\n${HELP}`);
        return 1;
    }
  } catch (err) {
    log(`שגיאה: ${err.message}`);
    return 1;
  }
}

// מריצים רק כשהקובץ הופעל ישירות (node src/cli.js), לא כשמייבאים אותו בבדיקות
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "expenses.json");
  process.exitCode = run(process.argv.slice(2), { filePath });
}
