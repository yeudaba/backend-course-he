// P07-E22: מתוקן
function getField(obj, fieldName) {
  return obj[fieldName];
}

function toLines(obj) {
  return Object.entries(obj).map(([key, value]) => `${key}: ${value}`);
}

function sameContent(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

console.log(getField({ city: "חיפה" }, "city"), toLines({ a: 1 }), sameContent({ x: [1] }, { x: [1] }));

module.exports = { getField, toLines, sameContent };
