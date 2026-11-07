// P05-E19: קבלה עם פונקציות
// formatLine("mouse", 89.9) → "MOUSE...............   89.90" (בדיוק width תווים; הסכום תופס 8)
function formatLine(label, amount, width = 28) {
  // כתוב כאן
}

// סה״כ אחרי הנחה באחוזים ואחרי מע״מ, מעוגל ל־2 ספרות (מספר)
// calcTotals(358.4, 10, 0.18) → 380.62
function calcTotals(subtotal, couponPercent, vatRate) {
  // כתוב כאן
}

console.log(formatLine("mouse", 89.9));

module.exports = { formatLine, calcTotals };
