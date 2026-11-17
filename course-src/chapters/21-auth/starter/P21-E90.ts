// P21-E90: InMemoryTasksRepository עם ownerId מוסתר
// כתוב וייצא type Task = { id, title, done } ו־class InMemoryTasksRepository:
//   insert(ownerId, { title, done? }), list(ownerId), findById(ownerId, id), update(ownerId, id, changes), delete(ownerId, id)
//   בפנים StoredTask = Task & { ownerId } | בחוץ תמיד אובייקט חדש בלי ownerId | של אחר ← undefined / false
//
// הרצה:   node 21-auth/starter/P21-E90.ts
// בדיקה:  npm run check P21-E90
