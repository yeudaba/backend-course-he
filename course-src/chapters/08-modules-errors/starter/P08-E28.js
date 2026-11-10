// P08-E28: מפרש פקודות ל־CLI (חזרה על switch ו־split)
// כתוב פונקציה parseCommand(line):
//   "add 25 קפה בבוקר" → { cmd: "add", amount: 25, note: "קפה בבוקר" }
//   "add 12.5"         → { cmd: "add", amount: 12.5, note: "" }
//   "list"             → { cmd: "list" }
//   "total"            → { cmd: "total" }
// רווחים מיותרים לא משנים; שם הפקודה בלי תלות באותיות גדולות.
// שגיאות (throw new Error):
//   add עם סכום חסר / לא מספר / לא חיובי → "סכום לא תקין"
//   שורה ריקה                            → "לא הוקלדה פקודה"
//   פקודה אחרת                           → 'פקודה לא מוכרת: "xyz"'
// בסוף הקובץ: module.exports = { parseCommand };
//
// הרצה:   node 08-modules-errors/starter/P08-E28.js
// בדיקה:  npm run check P08-E28
