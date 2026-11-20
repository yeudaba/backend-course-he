// P08-E83: בודקי קלט לטופס
// isMobile(text): נייד ישראלי — 05, עוד ספרה, מקף אופציונלי, 7 ספרות.
// isPostalCode(text): בדיוק 7 ספרות.
// isUsername(text): 3–16 תווים; ראשון a-z, ואחריו a-z, 0-9 או _.
// כל אחת: regex אחד ו־test.
//
// הרצה:   node 08-modules-errors/starter/P08-E83.js
// בדיקה:  npm run check P08-E83

function isMobile(text) {
  // כתוב כאן
}

function isPostalCode(text) {
  // כתוב כאן
}

function isUsername(text) {
  // כתוב כאן
}

console.log(isMobile("052-1234567"), isMobile("052-123456"), isPostalCode("6100000"), isUsername("dana_2026"), isUsername("2dana"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציות. אל תמחק אותה.
module.exports = { isMobile, isPostalCode, isUsername };
