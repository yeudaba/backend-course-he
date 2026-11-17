// P26-E99: ה־worker — עבודה ← פונקציה
// כתוב וייצא async handleJob(job, deps)
//   order-confirmation ← deps.emails.sendOrderConfirmation(orderId) · expire-order ← deps.orders.expire(orderId)
//   אחר ← Error("עבודה לא מוכרת: <name>")
//
// בדיקה:  npm run check P26-E99
