// P06-E23: עגלה — reduce ו־הסרה בלי תופעות לוואי
function cartTotal(prices) {
  return prices.reduce((sum, p) => sum + p, 0);
}

function removeItem(cart, index) {
  return cart.filter((_, i) => i !== index);
}

const cart = ["עט", "מחברת", "תיק"];
console.log(cartTotal([]), removeItem(cart, 1), cart);

module.exports = { cartTotal, removeItem };
