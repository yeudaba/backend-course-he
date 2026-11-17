// P07-E61: pick — רק השדות שביקשו
// pick(obj, keys): אובייקט חדש רק עם השדות שב־keys (רק אם הם לא undefined ב־obj).
//
// הרצה:   node 07-objects/starter/P07-E61.js
// בדיקה:  npm run check P07-E61

function pick(obj, keys) {
  // כתוב כאן
}

const user = { id: 1, name: "דנה", passwordHash: "x9f...", email: "d@m.com" };
console.log(pick(user, ["id", "name", "email"]), pick(user, ["id", "phone"]));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { pick };
