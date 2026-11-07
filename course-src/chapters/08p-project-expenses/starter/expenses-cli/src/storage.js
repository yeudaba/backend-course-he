// שמירה וטעינה של ההוצאות מקובץ JSON.
import fs from "node:fs";
import { expenseError } from "./expenses.js";

// קובץ לא קיים → [] | JSON לא תקין או לא מערך → expenseError("CORRUPT_FILE", `קובץ הנתונים פגום: ${filePath}`)
export function loadExpenses(filePath) {
  // כתוב כאן (fs.existsSync, fs.readFileSync)
}

// כותבת את המערך כ־JSON מעוצב (הזחה של 2)
export function saveExpenses(filePath, expenses) {
  // כתוב כאן (fs.writeFileSync)
}
