// P24-E88: לקוח שמכבד Retry-After
// כתוב וייצא async fetchPolitely(fetchFn, url, init, { sleep, maxRetries = 2, maxWaitSeconds = 60 })
//   429/503 עם Retry-After בשניות ← מחכים ושולחים שוב
//
// בדיקה:  npm run check P24-E88
