// P07-E83: כמה ימים עברו?
// daysBetween(fromIso, toIso): כמה ימים שלמים (Math.floor) עברו מ־fromIso עד toIso.
// שלילי אם toIso לפני fromIso. תאריך לא תקין ← null.
//
// הרצה:   node 07-objects/starter/P07-E83.js
// בדיקה:  npm run check P07-E83

function daysBetween(fromIso, toIso) {
  // כתוב כאן
}

console.log(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T10:00:00Z"));
console.log(daysBetween("2026-11-01T10:00:00Z", "2026-11-19T09:00:00Z"));
console.log(daysBetween("2026-11-19T10:00:00Z", "2026-11-01T10:00:00Z"));
console.log(daysBetween("2026-11-01T10:00:00Z", "מחר"));

// השורה הזו מאפשרת לבודק להשתמש בפונקציה. אל תמחק אותה.
module.exports = { daysBetween };
