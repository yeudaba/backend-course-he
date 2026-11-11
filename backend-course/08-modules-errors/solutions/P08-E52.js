function assertShape(obj, shape) {
  for (const [field, type] of Object.entries(shape)) {
    const actual = typeof obj[field];
    if (actual !== type) {
      const err = new Error(`${field}: ציפינו ל־${type} וקיבלנו ${actual}`);
      err.field = field;
      err.status = 400;
      throw err;
    }
  }
  return true;
}

const shape = { name: "string", price: "number", inStock: "boolean" };
try {
  assertShape({ name: "עט", price: "5", inStock: true }, shape);
} catch (err) {
  console.log(err.status, err.field, err.message);
}

module.exports = { assertShape };
