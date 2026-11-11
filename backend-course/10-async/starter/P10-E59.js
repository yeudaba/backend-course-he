// P10-E59: משתמשים מקובץ CSV
// loadUsers(file, callback): CSV עם כותרת name,age,city ← callback(null, [{ name, age, city }])
//   בלי רווחים בקצוות, age כמספר, מדלגים על הכותרת ועל שורות ריקות
//   שורה בלי 3 שדות או גיל לא מספרי → callback(new Error("שורה N לא תקינה")) (הכותרת = שורה 1)
//   שגיאת קריאה → callback(err). תמיד פעם אחת.
// בסוף הקובץ: module.exports = { loadUsers };
//
// הרצה:   node 10-async/starter/P10-E59.js
// בדיקה:  npm run check P10-E59
