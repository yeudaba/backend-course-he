// P05-E08: מחיר כולל מע״מ
function totalWithVat(unitPrice, quantity, vatRate) {
  const subtotal = unitPrice * quantity;
  const total = subtotal * (1 + vatRate);
  return Math.round(total * 100) / 100;
}

console.log(totalWithVat(49.9, 3, 0.18));

module.exports = { totalWithVat };
