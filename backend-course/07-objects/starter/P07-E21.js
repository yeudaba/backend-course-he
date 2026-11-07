// P07-E21: צריך להחזיר עותק במבצע, ולא לגעת במקור.
// applySale({ name: "מקלדת", price: 200, history: [220] }, 10)
//   → { name: "מקלדת", price: 180, history: [220, 200] }   והמקור נשאר כמו שהוא
function applySale(product, percent) {
  const copy = { ...product };
  copy.history.push(product.price);
  product.price = Math.round(product.price * (1 - percent / 100) * 100) / 100;
  copy.price = product.price;
  return copy;
}

module.exports = { applySale };
