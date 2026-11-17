// P18-E42: ייבוא העברות מ־CSV
// כתוב וייצא async function importTransfers(pool, csv: string): Promise<number>
//   כותרת from,to,amount; שורות ריקות — מדלגים. קודם מפענחים הכול (שגיאה: שורה <n>: לא תקינה)
//   ואז transaction אחד. שגיאה מהמסד ← ROLLBACK ו־throw new Error(`שורה ${n}: ${err.message}`)
//
// בדיקה:  npm run check P18-E42
