// P19-E80: מחיקת לקוח — לא נמצא, או "יש לו הזמנות"
// כתוב וייצא class AppError (עם code) ו־async function deleteCustomer(prisma, id): Promise<boolean>
//   true | P2025 ← false | P2003 ← AppError("HAS_ORDERS") | אחרת — throw
//
// בדיקה:  npm run check P19-E80
