// P10-E66: בדיקת גיל — כ־Promise
// checkAge(age) → new Promise שמסתיים אחרי 10ms:
//   age לא מספר / שלילי → reject(new RangeError("גיל לא תקין"))
//   age >= 18 → resolve("מותר"), אחרת → resolve("אסור")
// בסוף הקובץ: module.exports = { checkAge };
//
// הרצה:   node 10-async/starter/P10-E66.js
// בדיקה:  npm run check P10-E66
