// P10-E28: כל העמודים (חזרה על while ו־spread)
// כתוב async function fetchAll(getPage, maxPages = 100):
//   getPage(n) מחזירה Promise עם { items, next } — next הוא מספר העמוד הבא, או null בעמוד האחרון
//   מתחילים מעמוד 1, ממשיכים לפי next, ומחזירים מערך אחד עם כל הפריטים לפי הסדר
//   אחרי maxPages עמודים, אם עדיין יש next → throw new Error("יותר מדי עמודים")
// בסוף הקובץ: module.exports = { fetchAll };
//
// הרצה:   node 10-async/starter/P10-E28.js
// בדיקה:  npm run check P10-E28
