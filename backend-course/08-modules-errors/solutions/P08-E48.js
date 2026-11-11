function assertPositive(value, name) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new Error(`${name} חייב להיות מספר חיובי`);
  }
  return value;
}

try {
  console.log(assertPositive(5, "מחיר"));
  assertPositive(0, "כמות");
} catch (err) {
  console.log(err.message);
}

module.exports = { assertPositive };
