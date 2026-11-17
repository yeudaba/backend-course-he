// P18-E54: מגבלה יומית להעברות
// כתוב וייצא class AppError (עם code) ו־
//   async function transferWithLimit(pool, fromId, toId, amount, dailyLimit): Promise<number>
//   transaction; FOR UPDATE על החשבון; ACCOUNT_NOT_FOUND; סכום היוצאות של היום + amount > dailyLimit ← DAILY_LIMIT
//   אחרת — הורדה, הוספה, רישום (RETURNING id)
//
// בדיקה:  npm run check P18-E54
