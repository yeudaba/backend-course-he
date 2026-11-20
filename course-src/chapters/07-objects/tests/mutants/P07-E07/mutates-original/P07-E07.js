function priceOf(catalog, code) {
  return catalog[code.trim().toUpperCase()] ?? null;
}
function withProduct(catalog, code, price) {
  catalog[code.trim().toUpperCase()] = price;
  return catalog;
}
module.exports = { priceOf, withProduct };
