// P08-E24: מודול בנק. account = { id, owner, balance }. אף פונקציה לא משנה את הקלט.
function bankError(code, message) {
  // Error עם שדה code
}

// סכום לא חיובי / לא מספר → bankError("INVALID_AMOUNT", "סכום לא תקין")
function deposit(account, amount) {
  // כתוב כאן
}

// + אין מספיק → bankError("INSUFFICIENT_FUNDS", "אין מספיק יתרה")
function withdraw(account, amount) {
  // כתוב כאן
}

// מחזירה [newFrom, newTo]. אותו id → bankError("SAME_ACCOUNT", "לא ניתן להעביר לאותו חשבון")
function transfer(from, to, amount) {
  // כתוב כאן
}

// לא זורקת: { ok: true, from, to } או { ok: false, code, message, from, to } (המקוריים)
function safeTransfer(from, to, amount) {
  // כתוב כאן
}

module.exports = { bankError, deposit, withdraw, transfer, safeTransfer };
