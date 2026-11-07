// P06-E23
// cartTotal([10, 20]) → 30 | cartTotal([]) → 0
function cartTotal(prices) {
  return prices.reduce((sum, p) => sum + p);
}

// מחזירה עגלה חדשה בלי הפריט באינדקס index. לא משנה את המקור!
// removeItem(["עט", "מחברת", "תיק"], 1) → ["עט", "תיק"]
function removeItem(cart, index) {
  return cart.splice(index, 1);
}

console.log(cartTotal([10, 20]), removeItem(["עט", "מחברת", "תיק"], 1));

module.exports = { cartTotal, removeItem };
