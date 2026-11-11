// P17-E44: הוספת פריט מ־Node, עם קודי השגיאה
// כתוב וייצא את הטיפוסים Db ו־AddResult, ואת
//   async function addOrderItem(client, orderId, productId, quantity): Promise<AddResult>
//   מחיר של מוצר פעיל (אין ← not_found), INSERT ל־order_items, ושגיאות לפי err.code:
//   23503 ← not_found, 23505 ← duplicate, 23514 ← invalid, אחרת — throw
//
// בדיקה:  npm run check P17-E44
