// P15-E56: timeout ל־route אסינכרוני
// כתוב וייצא withTimeout(handler: (req, res) => Promise<unknown>, ms) — מחזירה handler (req, res, next):
//   לא נשלחה תשובה תוך ms → 503 { error: { code: "TIMEOUT", message: "הבקשה לקחה יותר מדי זמן" } }
//   clearTimeout כשסיים; זרק → next(err) אם עוד לא נשלחה תשובה
//
// הרצה:   node 15-express/starter/P15-E56.ts
// בדיקה:  npm run check P15-E56
