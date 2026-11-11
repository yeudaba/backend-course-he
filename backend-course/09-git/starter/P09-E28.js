// P09-E28: מי בפנים ומי בחוץ — .gitignore קטן (חזרה על מתודות של מחרוזות ו־some)
// כתוב פונקציה isIgnored(filePath, gitignore):
//   filePath — נתיב יחסי כמו "src/app.log" או "node_modules/lodash/index.js"
//   gitignore — כל התוכן של קובץ .gitignore, כמחרוזת אחת
// כללים: שורות ריקות ושורות שמתחילות ב־# — לא נחשבות. רווחים בקצוות השורה — לא נחשבים.
//   "name/" → תיקייה: הנתיב מתחיל ב־"name/" או מכיל "/name/"
//   "*.ext" → הנתיב נגמר ב־".ext"
//   אחרת   → שם מדויק: הנתיב שווה לשם, או נגמר ב־"/" + השם
// מחזירה true אם אחד הכללים מתאים.
// בסוף הקובץ: module.exports = { isIgnored };
//
// הרצה:   node 09-git/starter/P09-E28.js
// בדיקה:  npm run check P09-E28
