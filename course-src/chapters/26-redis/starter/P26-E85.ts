// P26-E85: timeout בתוך worker
// כתוב וייצא startWorkerWithTimeout(connection, prefix, queueName, handler, timeoutMs) ← Worker
//   מחזיר את התוצאה של handler(job.data) · לא הסתיים בזמן ← Error("TIMEOUT") · clearTimeout תמיד
//
// בדיקה:  npm run check P26-E85
