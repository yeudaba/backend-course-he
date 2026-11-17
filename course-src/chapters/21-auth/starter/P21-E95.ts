// P21-E95: listTasks — עמוד משימות של משתמש אחד
// כתוב וייצא listTasks(db, ownerId, { status?, limit, offset }) ← { data: [{ id, title, status }], total }
//   רק של ownerId | status רק אם הגיע | ORDER BY created_at DESC, id DESC | total לפני LIMIT, כמספר | הכול בפרמטרים
//
// הרצה:   node 21-auth/starter/P21-E95.ts
// בדיקה:  npm run check P21-E95
