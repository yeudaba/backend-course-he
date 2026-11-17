function addVatAll(products) {
  return products.map((p) => ({ ...p, price: Math.round(p.price * 1.18 * 100) / 100 }));
}

const catalog = [{ name: "עט", price: 10 }];
console.log(addVatAll(catalog), addVatAll(catalog), catalog);

module.exports = { addVatAll };
