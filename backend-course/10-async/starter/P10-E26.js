// P10-E26: חיבור אסינכרוני עם callback (error-first)
// כתוב פונקציה addLater(a, b, callback):
//   אחרי 10ms → callback(null, a + b)
//   a או b אינם מספרים → callback(new TypeError("a ו־b חייבים להיות מספרים")), גם זה אחרי ההמתנה
//   ה־callback נקרא בדיוק פעם אחת, ואף פעם לא לפני ש־addLater חזרה.
// בסוף הקובץ: module.exports = { addLater };
//
// הרצה:   node 10-async/starter/P10-E26.js
// בדיקה:  npm run check P10-E26
