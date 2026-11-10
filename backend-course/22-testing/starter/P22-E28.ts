// P22-E28: memoizeAsync עם שעון מוזרק — חזרה על closures, Map ו־Promises
// כתוב וייצא memoizeAsync(fn, { ttlMs, now = Date.now }) → פונקציה עם אותה חתימה:
//   אותו ארגומנט בתוך ttlMs → אותה תשובה, בלי לקרוא שוב ל־fn — גם לקריאות שהגיעו בזמן ההמתנה (שומרים את ה־Promise)
//   now() >= זמן הקריאה + ttlMs → פג, קוראים שוב | fn נכשלה → כולם מקבלים את השגיאה, אבל היא לא נשמרת
//
// הרצה:   node 22-testing/starter/P22-E28.ts
// בדיקה:  npm run check P22-E28
