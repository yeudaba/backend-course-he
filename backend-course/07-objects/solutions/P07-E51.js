function lowStock(products, threshold = 3) {
  return products
    .filter((p) => p.stock <= threshold)
    .map((p) => ({ name: p.name, stock: p.stock }))
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
}

const products = [
  { id: 1, name: "מקלדת", price: 249, stock: 4 },
  { id: 2, name: "עכבר", price: 89, stock: 0 },
  { id: 3, name: "מסך", price: 899, stock: 2 },
  { id: 4, name: "כבל", price: 19, stock: 2 },
];
console.log(lowStock(products));

module.exports = { lowStock };
