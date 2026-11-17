function updateStock(product, delta) {
  const next = product.stock + delta;
  if (next < 0) {
    return false;
  }
  product.stock = next;
  product.inStock = next > 0;
  return true;
}

const p = { name: "עכבר", stock: 2, inStock: true };
console.log(updateStock(p, -2), p);
console.log(updateStock(p, -1), p);

module.exports = { updateStock };
