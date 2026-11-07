// P07-E06: יצירת מוצר
function createProduct(name, price, stock = 0) {
  return { name: name.trim(), price, stock, inStock: stock > 0 };
}

function describeProduct(product) {
  const stockText = product.inStock ? `במלאי: ${product.stock}` : "אזל";
  return `${product.name} — ₪${product.price.toFixed(2)} (${stockText})`;
}

const kb = createProduct(" מקלדת ", 249, 4);
console.log(kb);
console.log(describeProduct(kb));

module.exports = { createProduct, describeProduct };
