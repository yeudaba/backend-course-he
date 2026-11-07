// P08-E23: הרץ npx eslint על הקובץ ו־npm run check P08-E23, ותקן הכול.
// priceWithVat(100) → 118 | isFree("0") → true | isFree("") → false | isFree(5) → false
var DEFAULT_VAT = 0.18;

function roundPrice(price) {
  return Math.round(price * 100) / 100;
}

function priceWithVat(price, vatRate = DEFAULT_VAT) {
  let result = Math.rounf(price * (1 + vatRate) * 100) / 100;
  return result;
}

function isFree(price) {
  return price == 0;
}

module.exports = { roundPrice, priceWithVat, isFree };
