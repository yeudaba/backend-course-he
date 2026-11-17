// P15.5-E61: כפתור שננעל בזמן שליחה
// כתוב וייצא (export function ...):
//   withLock(button, fn) → async (...args): נעול → undefined; אחרת disabled + "שולח...", await fn(...args),
//   ובסוף (גם בשגיאה) disabled=false והטקסט המקורי; שגיאה נזרקת הלאה
//
// בדיקה:  npm run check P15.5-E61
