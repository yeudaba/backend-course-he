// P08-E75: שורת הסיכום
// summaryLine(problems) → "✖ 3 problems (1 error, 2 warnings)" | אחד → "1 problem", "1 error"... | ריק → ""
//
// הרצה:   node 08-modules-errors/starter/P08-E75.js
// בדיקה:  npm run check P08-E75

function summaryLine(problems) {
  // כתוב כאן
}

console.log(summaryLine([{ severity: "error" }, { severity: "warning" }, { severity: "warning" }]));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { summaryLine };
