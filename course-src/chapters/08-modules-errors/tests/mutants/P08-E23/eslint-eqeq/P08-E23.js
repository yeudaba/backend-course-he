// P08-E23
const DEFAULT_VAT = 0.18;
function roundPrice(price) { return Math.round(price * 100) / 100; }
function priceWithVat(price, vatRate = DEFAULT_VAT) { return roundPrice(price * (1 + vatRate)); }
function isFree(price) { return String(price).trim() != "" && price == 0; }
module.exports = { roundPrice, priceWithVat, isFree };
