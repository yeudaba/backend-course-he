// לוגיקה טהורה של הוצאות: בלי קבצים, בלי הדפסות — רק נתונים פנימה ונתונים החוצה.

export function expenseError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

export function isValidDate(text) {
  const parts = String(text).split("-");
  if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
    return false;
  }
  const [year, month, day] = parts.map(Number);
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

export function parseAmount(input) {
  const text = String(input).trim();
  const amount = Number(text);
  if (text === "" || Number.isNaN(amount) || amount <= 0) {
    throw expenseError("INVALID_AMOUNT", `סכום לא תקין: ${input}`);
  }
  return Math.round(amount * 100) / 100;
}

export function nextId(expenses) {
  return expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
}

export function addExpense(expenses, { date, category, amount, note = "" }) {
  if (!isValidDate(date)) {
    throw expenseError("INVALID_DATE", `תאריך לא תקין: ${date} (פורמט: YYYY-MM-DD)`);
  }
  const cleanCategory = String(category ?? "").trim().toLowerCase();
  if (cleanCategory === "") {
    throw expenseError("INVALID_CATEGORY", "חובה לציין קטגוריה");
  }
  const expense = {
    id: nextId(expenses),
    date,
    category: cleanCategory,
    amount: parseAmount(amount),
    note: String(note).trim(),
  };
  return [...expenses, expense];
}

export function removeExpense(expenses, id) {
  const numericId = Number(id);
  if (!expenses.some((e) => e.id === numericId)) {
    throw expenseError("NOT_FOUND", `לא נמצאה הוצאה עם מזהה ${id}`);
  }
  return expenses.filter((e) => e.id !== numericId);
}

export function filterExpenses(expenses, { category, month } = {}) {
  return expenses.filter(
    (e) =>
      (category === undefined || e.category === category.trim().toLowerCase()) &&
      (month === undefined || e.date.startsWith(`${month}-`))
  );
}

export function monthlySummary(expenses, month) {
  const inMonth = filterExpenses(expenses, { month });
  const byCategory = {};
  for (const e of inMonth) {
    byCategory[e.category] = Math.round(((byCategory[e.category] ?? 0) + e.amount) * 100) / 100;
  }
  const total = Math.round(inMonth.reduce((s, e) => s + e.amount, 0) * 100) / 100;
  let topCategory = null;
  for (const [category, sum] of Object.entries(byCategory)) {
    if (topCategory === null || sum > byCategory[topCategory]) {
      topCategory = category;
    }
  }
  return { month, count: inMonth.length, total, byCategory, topCategory };
}

export function formatExpenses(expenses) {
  if (expenses.length === 0) {
    return "אין הוצאות להצגה";
  }
  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  return sorted
    .map((e) => {
      const note = e.note ? `  ${e.note}` : "";
      return `#${String(e.id).padEnd(4)}${e.date}  ${e.category.padEnd(12)}${e.amount.toFixed(2).padStart(10)}${note}`;
    })
    .join("\n");
}

export function formatSummary(summary) {
  const lines = [`סיכום ${summary.month}: ${summary.count} הוצאות, סה״כ ${summary.total.toFixed(2)}`];
  const entries = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
  for (const [category, sum] of entries) {
    lines.push(`  ${category.padEnd(12)}${sum.toFixed(2).padStart(10)}`);
  }
  return lines.join("\n");
}
