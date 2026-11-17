// P10-E54: לעטוף readFile ב־Promise
// readText(file)  → new Promise שעוטף את fs.readFile (utf8): מצליח עם התוכן / נכשל עם השגיאה המקורית
// readUpper(file) → readText(file).then(...) עם התוכן באותיות גדולות
// בסוף הקובץ: module.exports = { readText, readUpper };
//
// הרצה:   node 10-async/starter/P10-E54.js
// בדיקה:  npm run check P10-E54
