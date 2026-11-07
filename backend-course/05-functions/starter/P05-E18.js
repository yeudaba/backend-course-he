// P05-E18: ציון חוזק סיסמה
function hasDigit(text) {
  // כתוב כאן
}

function hasUpper(text) {
  // אות גדולה באנגלית
}

function hasSpecial(text) {
  // אחד מהתווים !@#$%
}

// נקודה על כל אחד: אורך 8+, ספרה, אות גדולה, תו מיוחד → 0 עד 4
function passwordScore(password) {
  // כתוב כאן
}

// 0–1 → "חלשה" | 2–3 → "בינונית" | 4 → "חזקה"
function passwordLabel(password) {
  // כתוב כאן
}

console.log(passwordLabel("Secret123!"));

module.exports = { hasDigit, hasUpper, hasSpecial, passwordScore, passwordLabel };
