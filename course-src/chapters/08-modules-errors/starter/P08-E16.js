// P08-E16: פריט בלי qty — הכמות היא 1. כמות 0 — חוקית (0).
// orderTotal([{ price: 10, qty: 2 }, { price: 5 }, { price: 3, qty: 0 }]) → 25
function orderTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total;
}

orderTotal([{ price: 10, qty: 2 }, { price: 5 }, { price: 3, qty: 0 }]);

module.exports = { orderTotal };
