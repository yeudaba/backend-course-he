// P07-E35: שדה או ברירת מחדל
// fieldOr(obj, key, fallback): obj[key], או fallback אם הוא null/undefined (0 ו־"" הם ערכים).
//
// הרצה:   node 07-objects/starter/P07-E35.js
// בדיקה:  npm run check P07-E35

function fieldOr(obj, key, fallback) {
  // כתוב כאן
}

const settings = { theme: "dark", fontSize: 0, lang: null };
console.log(fieldOr(settings, "fontSize", 14), fieldOr(settings, "lang", "he"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { fieldOr };
