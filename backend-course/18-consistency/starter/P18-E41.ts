// P18-E41: route של העברה — Zod, transaction ו־status
// כתוב וייצא async function handleTransfer(pool, body: unknown): Promise<{ status, body }>
//   400 VALIDATION / 400 SAME_ACCOUNT / 404 ACCOUNT_NOT_FOUND / 409 INSUFFICIENT_FUNDS / 201 { id }
//   כל שגיאה אחרת — ROLLBACK ו־throw
//
// בדיקה:  npm run check P18-E41
