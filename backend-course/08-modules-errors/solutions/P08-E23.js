// P08-E23: נקי מ־ESLint
function roundPrice(price) {
  return Math.round(price * 100) / 100;
}

function priceWithVat(price, vatRate = 0.18) {
  return roundPrice(price * (1 + vatRate));
}

function isFree(price) {
  return String(price).trim() !== "" && Number(price) === 0;
}

console.log(priceWithVat(100), isFree("0"), isFree(""));

module.exports = { roundPrice, priceWithVat, isFree };
