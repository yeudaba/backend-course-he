// P08-E48: assertPositive
// assertPositive(value, name): מספר חיובי → מחזירה אותו. אחרת throw new Error(`${name} חייב להיות מספר חיובי`).
//
// הרצה:   node 08-modules-errors/starter/P08-E48.js
// בדיקה:  npm run check P08-E48

function assertPositive(value, name) {
  // כתוב כאן
}

try {
  console.log(assertPositive(5, "מחיר"));
  assertPositive(0, "כמות");
} catch (err) {
  console.log(err.message);
}

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { assertPositive };
