// P10-E67: קורא JSON עם then
// readJson(file) עם fs/promises ו־then/catch בלבד (בלי async/await):
//   מצליחה עם האובייקט; קובץ חסר → השגיאה המקורית
//   JSON לא תקין → Error(`JSON לא תקין ב־${file}`)
// בסוף הקובץ: module.exports = { readJson };
//
// הרצה:   node 10-async/starter/P10-E67.js
// בדיקה:  npm run check P10-E67
