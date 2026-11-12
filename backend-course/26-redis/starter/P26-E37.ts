// P26-E37: עגלת קניות ב־hash — מקובץ ריק
// כתוב וייצא (redis הוא Redis של ioredis; המפתח: cart:<userId>):
//   addToCart(redis, userId, productId, qty) → הכמות החדשה (0 ומחיקת השדה אם ירדה ל־0 או פחות) · תוקף 7 ימים
//   getCart(redis, userId) → { [productId]: כמות כמספר }
//   clearCart(redis, userId) → true אם הייתה עגלה
//
// בדיקה:  npm run check P26-E37
