// P26-E97: ביטול הזמנה שפגה — בתנאי, בטרנזקציה
// כתוב וייצא async expireOrder(pool, orderId) → "expired" | "skipped"
//   UPDATE orders ... WHERE status = 'pending_payment' · אם עודכנה — מלאי חוזר · הכול בטרנזקציה אחת
//
// בדיקה:  npm run check P26-E97
