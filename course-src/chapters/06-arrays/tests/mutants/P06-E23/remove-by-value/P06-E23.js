const cartTotal = (prices) => prices.reduce((s, p) => s + p, 0);
const removeItem = (cart, index) => cart.filter((x) => x !== cart[index]);
module.exports = { cartTotal, removeItem };
