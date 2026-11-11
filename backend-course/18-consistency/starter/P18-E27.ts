// P18-E27: מאחד שליפות (batch loader) — חזרה על closures, Map ו־Promise
// כתוב וייצא type Person = { id: number; full_name: string } ו־createPersonLoader(pool) → load(id): Promise<Person | null>
//   כל הקריאות באותו סיבוב (לפני setTimeout(..., 0)) → שאילתה אחת: SELECT id, full_name FROM people WHERE id = ANY($1)
//   id שלא נמצא → null | id כפול נשלח פעם אחת | שגיאה → כל ה־Promises של הסיבוב נדחים | סיבוב חדש → שאילתה חדשה
//
// בדיקה:  npm run check P18-E27
