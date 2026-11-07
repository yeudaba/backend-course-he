// P07-E21: עותק אמיתי, בלי לגעת במקור
function applySale(product, percent) {
  const newPrice = Math.round(product.price * (1 - percent / 100) * 100) / 100;
  return { ...product, price: newPrice, history: [...product.history, product.price] };
}

const kb = { name: "מקלדת", price: 200, history: [220] };
const sale = applySale(kb, 10);
console.log(sale, kb);

module.exports = { applySale };
