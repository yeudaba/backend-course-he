// P18-E36: תשלום משכורות — הכול או כלום
// כתוב וייצא async function payMany(pool, fromId, payments: { toId, amount }[]): Promise<number[]>
//   transaction אחד; לכל תשלום: הורדה, הוספה (rowCount 0 ← throw new Error(`חשבון לא קיים: ${toId}`)), רישום RETURNING id
//   שגיאה ← ROLLBACK לכולם ו־throw. מערך ריק ← [] בלי לפנות למסד
//
// בדיקה:  npm run check P18-E36
