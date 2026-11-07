// P07-E14: סיכום עגלה
function cartSummary(cart) {
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const top = cart.reduce((best, it) => (best === null || it.price > best.price ? it : best), null);
  const lines = cart.map((it) => `${it.name} × ${it.qty} = ${it.price * it.qty}`);
  return { itemCount, subtotal, mostExpensive: top?.name ?? null, lines };
}

console.log(
  cartSummary([
    { name: "מקלדת", price: 249, qty: 1 },
    { name: "עכבר", price: 89, qty: 2 },
    { name: "כבל", price: 5, qty: 2 },
  ])
);

module.exports = { cartSummary };
