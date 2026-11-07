// P08-E16: סכום הזמנה עם כמות ברירת מחדל
function orderTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * (item.qty ?? 1);
  }
  return total;
}

console.log(orderTotal([{ price: 10, qty: 2 }, { price: 5 }, { price: 3, qty: 0 }]));

module.exports = { orderTotal };
