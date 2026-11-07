// לוגיקה טהורה של הוצאות: בלי קבצים, בלי הדפסות — רק נתונים פנימה ונתונים החוצה.
// הוצאה נראית כך: { id: 1, date: "2026-10-01", category: "food", amount: 54.5, note: "lunch" }

// Error עם שדה code (כמו bankError ב־P08-E24)
export function expenseError(code, message) {
  // כתוב כאן
}

// "2026-10-01" → true | "2026-02-30" → false | "2026-1-5" → false | "abc" → false
export function isValidDate(text) {
  // כתוב כאן
}

// "54.5" → 54.5 | "12.345" → 12.35 (עיגול ל־2 ספרות)
// ריק / לא מספר / 0 או פחות → זורקת expenseError("INVALID_AMOUNT", `סכום לא תקין: ${input}`)
export function parseAmount(input) {
  // כתוב כאן
}

// המזהה הבא: הגדול ביותר + 1 (ו־1 לרשימה ריקה)
export function nextId(expenses) {
  // כתוב כאן
}

// מחזירה מערך חדש עם ההוצאה בסוף. קטגוריה: trim + אותיות קטנות. note: trim (ברירת מחדל "")
// תאריך לא תקין → expenseError("INVALID_DATE", `תאריך לא תקין: ${date} (פורמט: YYYY-MM-DD)`)
// קטגוריה ריקה  → expenseError("INVALID_CATEGORY", "חובה לציין קטגוריה")
export function addExpense(expenses, { date, category, amount, note = "" }) {
  // כתוב כאן
}

// מחזירה מערך חדש בלי ההוצאה. id יכול להגיע כמחרוזת ("3")
// לא קיים → expenseError("NOT_FOUND", `לא נמצאה הוצאה עם מזהה ${id}`)
export function removeExpense(expenses, id) {
  // כתוב כאן
}

// category (בלי תלות באותיות גדולות) ו/או month ("2026-10") — כל אחד אופציונלי
export function filterExpenses(expenses, { category, month } = {}) {
  // כתוב כאן
}

// { month, count, total, byCategory: { food: 85.7, ... }, topCategory } — סכומים מעוגלים ל־2 ספרות
export function monthlySummary(expenses, month) {
  // כתוב כאן
}

// שורה לכל הוצאה, ממוין לפי תאריך:  "#1   2026-10-01  food             54.50  lunch"
// רשימה ריקה → "אין הוצאות להצגה"
export function formatExpenses(expenses) {
  // כתוב כאן
}

// "סיכום 2026-10: 3 הוצאות, סה״כ 97.70" ואחריה שורה לכל קטגוריה, מהגדולה לקטנה:
// "  food             85.70"
export function formatSummary(summary) {
  // כתוב כאן
}
