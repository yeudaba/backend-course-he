// P08-E08: זריקת שגיאות
function parsePositiveInt(input, fieldName = "ערך") {
  if (String(input).trim() === "") {
    throw new Error(`${fieldName}: שדה חובה`);
  }
  const n = Number(input);
  if (Number.isNaN(n)) {
    throw new Error(`${fieldName}: חייב להיות מספר`);
  }
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`${fieldName}: חייב להיות מספר שלם חיובי`);
  }
  return n;
}

try {
  console.log(parsePositiveInt("3", "כמות"));
  console.log(parsePositiveInt("2.5", "כמות"));
} catch (err) {
  console.log(err.message);
}

module.exports = { parsePositiveInt };
