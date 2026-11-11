// P17-E66: הכנסה לפי קטגוריה בטווח תאריכים
// כתוב וייצא את הטיפוסים Db ו־CategoryRevenue, ואת
//   async function categoryRevenue(client, { from, to, minRevenue = 0 }): Promise<CategoryRevenue[]>
//   הזמנות שלא בוטלו, created_at >= from ו־< to; units, revenue לכל קטגוריה; HAVING revenue >= minRevenue
//   מיון: revenue יורד, ואז category. מספרים, פרמטרים. from >= to ← throw (בלי לפנות למסד)
//
// בדיקה:  npm run check P17-E66
