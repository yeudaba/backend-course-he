// P07-E74: אינדקס לפי מזהה
// indexById(items): Map של id → הפריט.
// nameOf(index, id): השם של הפריט, או "לא נמצא".
//
// הרצה:   node 07-objects/starter/P07-E74.js
// בדיקה:  npm run check P07-E74

function indexById(items) {
  // כתוב כאן
}

function nameOf(index, id) {
  // כתוב כאן
}

const index = indexById([{ id: 1, name: "מקלדת" }, { id: 2, name: "עכבר" }]);
console.log(nameOf(index, 1), nameOf(index, 9));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { indexById, nameOf };
