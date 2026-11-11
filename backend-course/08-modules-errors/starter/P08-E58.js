// P08-E58: השורה העליונה
// topFrame(err): שורת ה־"at" הראשונה ב־err.stack, אחרי trim. אין → null.
//
// הרצה:   node 08-modules-errors/starter/P08-E58.js
// בדיקה:  npm run check P08-E58

function topFrame(err) {
  // כתוב כאן
}

try {
  null.price;
} catch (err) {
  console.log(topFrame(err));
}

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { topFrame };
