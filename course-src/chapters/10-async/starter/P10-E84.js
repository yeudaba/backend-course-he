// P10-E84: מדליקים ומכבים "טוען..."
// withLoading(task, setLoading):
//   setLoading(true), ואז task() (מחזירה Promise)
//   כש־task מסתיים — בהצלחה או בכישלון — setLoading(false), פעם אחת
//   מחזירה Promise עם אותה תוצאה של task (אותו ערך, או אותה שגיאה)
// בלי async/await — רק מתודות של Promise.
// בסוף הקובץ: module.exports = { withLoading };
//
// הרצה:   node 10-async/starter/P10-E84.js
// בדיקה:  npm run check P10-E84
