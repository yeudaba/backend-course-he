// P24-E72: webhook פעם אחת — במסד
// כתוב וייצא async handlePaymentEvent(pool, { id, orderId, amountCents }) ← "processed" | "duplicate"
//   הטבלאות: 24-production/files/webhooks.sql. הזמנה לא קיימת ← Error("ORDER_NOT_FOUND") בלי לרשום את האירוע
//
// בדיקה:  npm run check P24-E72
