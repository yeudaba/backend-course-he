// P26-E77: worker עם התקדמות
// כתוב וייצא startImportWorker(connection, prefix, handleItem) ← Worker של BullMQ לתור "imports"
//   job.data = { items: string[] } · לפי הסדר · אחרי כל פריט job.updateProgress(אחוז שלם)
//   מחזיר { processed: n } · בלי פריטים ← התקדמות 100
//
// בדיקה:  npm run check P26-E77
