// P21-E79: פתקים עם בעלים (db = Client או Pool של pg)
// כתוב וייצא listNotes(db, ownerId), findNote(db, ownerId, id), updateNote(db, ownerId, id, { title?, body? }), deleteNote(db, ownerId, id)
//   owner_id בכל WHERE | Note = { id, title, body } בלי ownerId | update בשאילתה אחת עם RETURNING | delete ← boolean
//
// הרצה:   node 21-auth/starter/P21-E79.ts
// בדיקה:  npm run check P21-E79
