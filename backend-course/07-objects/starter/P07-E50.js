// P07-E50: חיפוש לפי אימייל
// findByEmail(users, email): המשתמש עם האימייל (email מנוקה: trim + אותיות קטנות). לא נמצא → null.
//
// הרצה:   node 07-objects/starter/P07-E50.js
// בדיקה:  npm run check P07-E50

function findByEmail(users, email) {
  // כתוב כאן
}

const users = [{ id: 1, email: "dana@mail.com" }, { id: 2, email: "omer@mail.com" }];
console.log(findByEmail(users, " Dana@Mail.com "), findByEmail(users, "x@mail.com"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { findByEmail };
