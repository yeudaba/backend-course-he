// P08-E17
// "2026-10-01, אוכל, 54.5" → { date: "2026-10-01", category: "אוכל", amount: 54.5 }
// זורקת Error("חסרים שדות") או Error("סכום לא תקין")
function parseLine(line) {
  // כתוב כאן
}

// מחזירה { expenses: [...], errors: [{ line, message }] } — שורות ריקות מדלגים
function parseExpenses(text) {
  // כתוב כאן
}

module.exports = { parseLine, parseExpenses };
