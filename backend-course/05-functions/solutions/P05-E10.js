// P05-E10: פורמט מחיר
function formatPrice(amount, currency = "₪", decimals = 2) {
  return `${currency} ${amount.toFixed(decimals)}`;
}

console.log(formatPrice(19.9));
console.log(formatPrice(5, "$", 0));

module.exports = { formatPrice };
