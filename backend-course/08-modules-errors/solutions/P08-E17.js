// P08-E17: ייבוא עם דוח שגיאות לכל שורה
function parseLine(line) {
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 3 || parts.some((p) => p === "")) {
    throw new Error("חסרים שדות");
  }
  const [date, category, amountText] = parts;
  const amount = Number(amountText);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("סכום לא תקין");
  }
  return { date, category, amount };
}

function parseExpenses(text) {
  const expenses = [];
  const errors = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      continue;
    }
    try {
      expenses.push(parseLine(lines[i]));
    } catch (err) {
      errors.push({ line: i + 1, message: err.message });
    }
  }
  return { expenses, errors };
}

const input = `2026-10-01, אוכל, 54.5
2026-10-02, תחבורה

2026-10-03, קפה, abc
2026-10-04, ספרים, 89`;
console.log(parseExpenses(input));

module.exports = { parseLine, parseExpenses };
