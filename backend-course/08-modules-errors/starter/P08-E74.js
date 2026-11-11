// P08-E74: שורה בסגנון ESLint
// formatProblem({ line, column, severity, message, rule }) → "  6:14  error  message  rule"
//
// הרצה:   node 08-modules-errors/starter/P08-E74.js
// בדיקה:  npm run check P08-E74

function formatProblem(p) {
  // כתוב כאן
}

console.log(formatProblem({ line: 1, column: 1, severity: "error", message: "Unexpected var, use let or const instead", rule: "no-var" }));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { formatProblem };
