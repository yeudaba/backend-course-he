// P05-E19: קבלה עם פונקציות
const AMOUNT_WIDTH = 8;

function formatLine(label, amount, width = 28) {
  return label.toUpperCase().padEnd(width - AMOUNT_WIDTH, ".") + amount.toFixed(2).padStart(AMOUNT_WIDTH);
}

function calcTotals(subtotal, couponPercent, vatRate) {
  const afterDiscount = subtotal * (1 - couponPercent / 100);
  const total = afterDiscount * (1 + vatRate);
  return Math.round(total * 100) / 100;
}

console.log(formatLine("mouse", 89.9));
console.log(formatLine("total", calcTotals(358.4, 10, 0.18)));

module.exports = { formatLine, calcTotals };
