// P25.5-E28: שאילתה מ־PostgreSQL ל־MySQL — חזרה על replace עם regex ופונקציה
// כתוב וייצא pgToMysql(sql, params) → { sql, params }
//   $n ← ?, ו־params החדש לפי סדר ההופעה ($2 פעמיים ← הפרמטר פעמיים) · $n בלי פרמטר ← RangeError
//   "שם" ← `שם` · בתוך מחרוזת '...' (שבה '' הוא גרש) לא נוגעים בכלום
//
// הרצה:   node 25v-mysql/starter/P25.5-E28.ts
// בדיקה:  npm run check P25.5-E28
