function productErrors(p) {
  const errors = [];
  if ((p.name ?? "").trim() === "") {
    errors.push("חסר שם");
  }
  if (typeof p.price !== "number" || Number.isNaN(p.price) || p.price <= 0) {
    errors.push("מחיר לא תקין");
  }
  if (!Number.isInteger(p.stock) || p.stock < 0) {
    errors.push("מלאי לא תקין");
  }
  return errors;
}

function validateAll(products) {
  const messages = [];
  for (let i = 0; i < products.length; i++) {
    for (const error of productErrors(products[i])) {
      messages.push(`שורה ${i + 1}: ${error}`);
    }
  }
  return messages;
}

console.log(validateAll([
  { name: "עט", price: 5, stock: 10 },
  { name: "  ", price: "5", stock: 1 },
  { name: "תיק", price: 120, stock: -2 },
]));

module.exports = { productErrors, validateAll };
