// P07-E22: שלושה באגים
// getField({ city: "חיפה" }, "city") → "חיפה"
function getField(obj, fieldName) {
  return obj.fieldName;
}

// toLines({ a: 1, b: 2 }) → ["a: 1", "b: 2"]
function toLines(obj) {
  return Object.entries(obj).map(([value, key]) => `${key}: ${value}`);
}

// האם שני אובייקטים עם אותו תוכן (באותו סדר שדות)
function sameContent(a, b) {
  return a === b;
}

module.exports = { getField, toLines, sameContent };
