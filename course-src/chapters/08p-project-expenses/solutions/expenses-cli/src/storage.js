// שמירה וטעינה של ההוצאות מקובץ JSON.
import fs from "node:fs";
import { expenseError } from "./expenses.js";

export function loadExpenses(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const text = fs.readFileSync(filePath, "utf8");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw expenseError("CORRUPT_FILE", `קובץ הנתונים פגום: ${filePath}`);
  }
  if (!Array.isArray(data)) {
    throw expenseError("CORRUPT_FILE", `קובץ הנתונים פגום: ${filePath}`);
  }
  return data;
}

export function saveExpenses(filePath, expenses) {
  fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2) + "\n", "utf8");
}
