// P07-E07: מחירון כאובייקט
function priceOf(catalog, code) {
  return catalog[code.trim().toUpperCase()] ?? null;
}

function withProduct(catalog, code, price) {
  return { ...catalog, [code.trim().toUpperCase()]: price };
}

const catalog = { "KB-101": 199, "MS-201": 89 };
console.log(priceOf(catalog, " kb-101 "), priceOf(catalog, "X"));
console.log(withProduct(catalog, "kb-102", 249), catalog);

module.exports = { priceOf, withProduct };
