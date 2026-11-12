// P24-E67: לקוח שמנסה שוב — עם אותו מפתח
// כתוב וייצא async sendWithRetry(send, body, { retries, sleep, newKey }) ← { status, body, attempts, key }
//   מפתח אחד לכל הניסיונות; שוב על שגיאת רשת, 5xx ו־409; המתנה 200, 400, 800...
//
// בדיקה:  npm run check P24-E67
