// P05-E25: עיצוב מספר עם פסיקים (בלי toLocaleString)
// formatNumber(1234567.891) → "1,234,567.89"
// formatNumber(-1234.5, 1)  → "-1,234.5"
// formatNumber(1000000, 0)  → "1,000,000"

// עוזרת: addCommas("1234567") → "1,234,567"
function addCommas(digits) {
  // כתוב כאן
}

function formatNumber(n, decimals = 2) {
  // כתוב כאן
}

console.log(formatNumber(1234567.891));

module.exports = { formatNumber, addCommas };
