// P07-E86: כרטיס מוצר — מתוקן
function getField(product, field) {
  const value = product[field];
  return value === undefined ? null : value;
}

function raisePrice(product, amount) {
  product.price = product.price + amount;
  return product;
}

function label(product) {
  return `${product.name} — ${product.price} ₪`;
}

const coffee = { name: "קפה", price: 12, stock: 40 };
console.log(getField(coffee, "stock"), getField(coffee, "color"));
console.log(raisePrice(coffee, 3));
console.log(label(coffee));

module.exports = { getField, raisePrice, label };
