// פתרון נכון בלי spread ובלי מפתח מחושב: העתקה בלולאה, ואז הצבה עם סוגריים
function priceOf(catalog, code) {
  const price = catalog[code.trim().toUpperCase()];
  return price === undefined ? null : price;
}
function withProduct(catalog, code, price) {
  const copy = {};
  for (const key of Object.keys(catalog)) {
    copy[key] = catalog[key];
  }
  copy[code.trim().toUpperCase()] = price;
  return copy;
}
module.exports = { priceOf, withProduct };
