// P08-E23
var DEFAULT_VAT = 0.18;
function roundPrice(price) { return Math.round(price * 100) / 100; }
function priceWithVat(price, vatRate = DEFAULT_VAT) {
  let result = Math.round(price * (1 + vatRate) * 100) / 100;
  return result;
}
function isFree(price) { return String(price).trim() !== "" && Number(price) === 0; }
module.exports = { roundPrice, priceWithVat, isFree };
