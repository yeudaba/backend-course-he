// P07-E20: מתוקן
const toSummaries = (products) => products.map((p) => ({ name: p.name, price: p.price }));
const findByName = (products, name) => products.find((p) => p.name === name) ?? null;
const outOfStock = (products) => products.filter((p) => p.stock === 0);

const products = [
  { name: "עט", price: 5, stock: 0 },
  { name: "דף", price: 1, stock: 9 },
];
console.log(toSummaries(products), findByName(products, "דף"), outOfStock(products).length);

module.exports = { toSummaries, findByName, outOfStock };
