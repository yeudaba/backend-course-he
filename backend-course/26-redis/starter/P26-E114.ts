// P26-E114: SSE של הזמנה — רק לבעלים
// כתוב וייצא orderEvents({ authenticate, ownerOf, bus }) ← handler ל־GET /orders/:id/events
//   לא מחובר ← 401 · לא קיימת / של אחר ← 404 · אחרת SSE עם אירועי "status" של ההזמנה הזו בלבד
//   לקוח סגר ← bus.off
//
// בדיקה:  npm run check P26-E114
