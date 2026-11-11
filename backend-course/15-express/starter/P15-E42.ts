// P15-E42: מחלקת אחסון מוזרקת
// כתוב וייצא class NotesStore (#notes, #nextId; add, get, list, remove) ו־createApp(store = new NotesStore()):
//   GET /notes · POST /notes { text } → 201 + Location (text 1–200 אחרי trim, אחרת 400 { error: "text לא תקין" })
//   GET /notes/:id → 200 / 404 { error: "לא נמצא" } · DELETE /notes/:id → 204 / 404
//
// הרצה:   node 15-express/starter/P15-E42.ts
// בדיקה:  npm run check P15-E42
