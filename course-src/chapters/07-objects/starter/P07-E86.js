// P07-E86: כרטיס מוצר — בכל פונקציה באג אחד, ואף אחד מהם לא זורק שגיאה.
// getField(product, field)    — ערך השדה ששמו ב־field. לא קיים ← null
// raisePrice(product, amount) — מעלה את price ב־amount (משנה את האובייקט) ומחזירה אותו
// label(product)              — "קפה — 12 ₪"
//
// הרצה:   node 07-objects/starter/P07-E86.js
// בדיקה:  npm run check P07-E86
function getField(product, field) {
  const value = product.field;
  return value === undefined ? null : value;
}

function raisePrice(product, amount) {
  product.price + amount;
  return product;
}

function label(product) {
  return `${product.Name} — ${product.price} ₪`;
}

const coffee = { name: "קפה", price: 12, stock: 40 };
console.log(getField(coffee, "stock"), getField(coffee, "color"));
console.log(raisePrice(coffee, 3));
console.log(label(coffee));

module.exports = { getField, raisePrice, label };
