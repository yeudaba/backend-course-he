// P15-E26: API משימות — מקובץ ריק
// כתוב וייצא createApp() — אפליקציית Express (בלי listen). משימות בזיכרון: { id, title, done }, ids מ־1:
//   GET /tasks (עם ?done=true / ?done=false — סינון) | GET /tasks/:id → המשימה או 404 { error: "המשימה לא נמצאה" }
//   POST /tasks { title, done? } → 201 + Location: /tasks/<id>. Zod: title אחרי trim 1–100, done בוליאני (ברירת מחדל false)
//        לא תקין → 400 { error: "קלט לא תקין", fields: ["title", ...] }
//   DELETE /tasks/:id → 204 או 404 | JSON שבור → 400 { error: "JSON לא תקין" }
//   כל אפליקציה מתחילה עם רשימה ריקה משלה.
//
// הרצה:   node 15-express/starter/P15-E26.ts
// בדיקה:  npm run check P15-E26
