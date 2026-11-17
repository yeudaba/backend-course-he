// P15-E63: משאב מקונן ב־Router
// כתוב וייצא createTasksRouter(service) — Router (מחובר ב־/tasks), עם router.use(express.json()):
//   GET /:id · GET /:id/comments → { data } · POST /:id/comments { text } → 201 + Location
//   404 TASK_NOT_FOUND ("המשימה לא נמצאה") · 400 VALIDATION_ERROR ("text לא תקין")
//
// הרצה:   node 15-express/starter/P15-E63.ts
// בדיקה:  npm run check P15-E63
