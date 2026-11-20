function priceOf(catalog, code) {
  return catalog[code.trim().toUpperCase()] ?? null;
}
function withProduct(catalog, code, price) {
  return { [code.trim().toUpperCase()]: price, ...catalog };
}
module.exports = { priceOf, withProduct };
