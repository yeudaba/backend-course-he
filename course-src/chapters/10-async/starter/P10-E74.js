// P10-E74: הגדרות עם ברירות מחדל
// loadSettings(file, defaults) עם fs/promises ו־then/catch (בלי await) → אובייקט חדש:
//   קובץ קיים → { ...defaults, ...מהקובץ }
//   ENOENT → עותק של defaults
//   כל שגיאה אחרת → נכשלת עם אותה שגיאה. אסור לשנות את defaults.
// בסוף הקובץ: module.exports = { loadSettings };
//
// הרצה:   node 10-async/starter/P10-E74.js
// בדיקה:  npm run check P10-E74
